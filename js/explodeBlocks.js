$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  Columns.explodeBlocks = function (view, blocks) {
    var exploder = new Exploder(view, blocks);
    exploder.explode();
  };

  var Exploder = function (view, blocks) {
    this.view = view;
    this.columns = view.columns;
    this.blocks = blocks;
    this.alreadyChecked = {};
    this.pendingFlashes = {};
    this.numPendingExplosions = blocks.length;

    for (var i = 0; i < this.numPendingExplosions; i++) {
      this.pendingFlashes[[this.blocks[i].col, this.blocks[i].row]] = 6;
    }
  };

  Exploder.prototype.explode = function () {
    this.spliceColumns();
    debugger;
    this.view.canvas.on("doneExploding", function () {
      if (--this.numPendingExplosions === 0) {
        this.view.canvas.off("doneExploding");
        this.view.executeDrop();
      }
    }.bind(this));

    var time = 0;
    this.blocks.forEach(function (block) {
      setTimeout(block.explode.bind(block, this.pendingFlashes), time);
      time += 30;
    }.bind(this));
  };

  Exploder.prototype.spliceColumns = function () {
    for (var i = 0; i < this.numPendingExplosions; i++) {
      var col = this.blocks[i].col;
      var row = this.blocks[i].row;

      if (!this.alreadyChecked[[row, col]]) {
        for (var n = row; n < this.columns[col].length; n++) {
          var node = this.columns[col][n];
          var nodeIndex = [node.col, node.row];

          this.alreadyChecked[nodeIndex] = true;
          if (!this.pendingFlashes[nodeIndex]) {
            this.view.addToDropQueue(node);
          }
        }

        this.columns[col].splice(row, this.columns[col].length);
      }
    }
  };
});