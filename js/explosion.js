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
    var lowest = this.lowestInColumns();
    for (var col in lowest) {
      var row = lowest[col].row;
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
  };

  Exploder.prototype.lowestInColumns = function () {
    var lowest = {};
    this.tiles.forEach(function (tile) {
      this.explosionIndices[[tile.col, tile.row]] = true;

      if (!lowest[tile.col] || lowest[tile.col].row > tile.row) {
        lowest[tile.col] = tile;
      }
    }.bind(this));

    return lowest;
  };
});