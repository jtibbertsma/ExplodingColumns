$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  Columns.explodeTiles = function (view, tiles) {
    var exploder = new Exploder(view, tiles);
    exploder.explode();
  };

  var Exploder = function (view, tiles) {
    this.view = view;
    this.columns = view.columns;
    this.tiles = tiles;
    this.alreadyChecked = {};
    this.numPendingExplosions = tiles.length;
    this.explosionIndices = [];

    tiles.forEach(function (tile) {
      this.explosionIndices[[tile.col, tile.row]] = true;
    }.bind(this));
  };

  Exploder.prototype.explode = function () {
    this.spliceColumns();

    this.view.canvas.on("doneExploding", function () {
      if (--this.numPendingExplosions === 0) {
        this.view.canvas.off("doneExploding");
        this.view.executeDrop();
      }
    }.bind(this));

    var time = 0;
    this.tiles.forEach(function (tile) {
      setTimeout(tile.explode.bind(tile), time);
      time += 30;
    }.bind(this));
  };

  Exploder.prototype.spliceColumns = function () {
    for (var i = 0; i < this.numPendingExplosions; i++) {
      var col = this.tiles[i].col;
      var row = this.tiles[i].row;

      if (!this.alreadyChecked[[col, row]]) {
        for (var n = row; n < this.columns[col].length; n++) {
          var node = this.columns[col][n];
          var nodeIndex = [node.col, node.row];

          this.alreadyChecked[nodeIndex] = true;
          if (!this.explosionIndices[nodeIndex]) {
            this.view.addToDropQueue(node);
          }
        }

        this.columns[col].splice(row, this.columns[col].length);
      }
    }
  };
});