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
    this.numPending = blocks.length;

    for (var i = 0; i < this.numPending; i++) {
      this.pendingFlashes[[this.blocks[i].col, this.blocks[i].row]] = 6;
    }
  };

  Exploder.prototype.explode = function () {
    this.spliceColumns();
    debugger;
  };

  Exploder.prototype.spliceColumns = function () {
    for (var i = 0; i < this.numPending; i++) {
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