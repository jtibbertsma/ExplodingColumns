$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  Columns.searchForExplosions = function (game) {
    var searcher = new Searcher(game);
    searcher.search();

    return searcher.exploders;
  };

  var Searcher = function (game) {
    this.game = game;
    this.columns = game.columns;
    this.searched = {};
    this.grays = {};
    this.exploders = [];
  };

  Searcher.prototype.search = function () {
    for (var i = 0; i < this.columns.length; i++) {
      for (var j = 0; j < this.columns[i].length; j++) {
        this.currentIteration = [];
        this.searchNode(this.columns[i][j]);

        if (this.currentIteration.length >= this.game.numberToExplode) {
          this.exploders = this.exploders.concat(this.currentIteration);
        }
      }
    }

    this.exploders = this.exploders.concat(this.grayNeighbors());
  };

  Searcher.prototype.searchNode = function (tile) {
    var tileNodeIndex = [tile.col, tile.row];
    if (this.searched[tileNodeIndex]) {
      return;
    }

    this.searched[tileNodeIndex] = true;

    if (tile.color === "gray") {
      return;
    }

    this.currentIteration.push(tile);

    var adjacent = this.getAdjacentOfSameColor(tile);
    for (var i = 0; i < adjacent.length; i++) {
      var nodeIndex = [adjacent[i].col, adjacent[i].row];

      if (!this.searched[nodeIndex]) {
        this.searchNode(adjacent[i]);
      }
    }
  };

  Searcher.prototype.validTile = function (i, j) {
    return i >= 0 && i < this.columns.length &&
           j >= 0 && j < this.columns[i].length;
  };

  Searcher.prototype.getAdjacent = function (tile) {
    var adjacent = [], i = tile.col, j = tile.row;

    if (this.validTile(i, j + 1)) {
      adjacent.push(this.columns[i][j + 1]);
    }

    if (this.validTile(i + 1, j)) {
      adjacent.push(this.columns[i + 1][j]);
    }

    if (this.validTile(i, j - 1)) {
      adjacent.push(this.columns[i][j - 1]);
    }

    if (this.validTile(i - 1, j)) {
      adjacent.push(this.columns[i - 1][j]);
    }

    return adjacent;
  };

  Searcher.prototype.getAdjacentOfSameColor = function (tile) {
    return this.getAdjacent(tile).filter(function (adjTile) {
      return adjTile.color === tile.color;
    });
  };

  Searcher.prototype.grayNeighbors = function () {
    var grays = [];
    this.exploders.forEach(function (tile) {
      grays = grays.concat(this.getAdjacent(tile).filter(function (maybeGray) {
        var index = [maybeGray.col, maybeGray.row];

        if (this.grays[index]) {
          return false;
        }

        if (maybeGray.color === "gray") {
          this.grays[index] = true;
          return true;
        }

        return false;
      }.bind(this)));
    }.bind(this));

    return grays;
  };
});