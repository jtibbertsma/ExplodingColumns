$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  Columns.explodeTiles = function (game, tiles) {
    var exploder = new Exploder(game, tiles);
    exploder.explode();
  };

  var Exploder = function (game, tiles) {
    this.game = game;
    this.columns = game.columns;
    this.tiles = tiles;
    this.alreadyChecked = {};
    this.numPendingExplosions = tiles.length;
    this.explosionIndices = [];
  };

  Exploder.prototype.explode = function () {
    this.spliceColumns();

    this.game.canvas.on("doneExploding", function () {
      if (--this.numPendingExplosions === 0) {
        this.game.canvas.off("doneExploding");
        this.game.executeDrop();
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
          this.game.addToDropQueue(node);
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