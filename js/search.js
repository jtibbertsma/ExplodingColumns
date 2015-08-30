$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  Columns.searchForExplosions = function (view) {
    var searcher = new Searcher(view);
    searcher.search();

    return searcher.exploders;
  };

  var Searcher = function (view) {
    this.view = view;
    this.columns = view.columns;
    this.searched = {};
    this.exploders = [];
  };

  Searcher.prototype.search = function () {
    for (var i = 0; i < this.columns.length; i++) {
      for (var j = 0; j < this.columns[i].length; j++) {
        this.currentIteration = [];
        this.searchNode(this.columns[i][j]);

        if (this.currentIteration.length >= this.view.numberToExplode) {
          this.exploders = this.exploders.concat(this.currentIteration);
        }
      }
    }
  };

  Searcher.prototype.searchNode = function (block) {
    var blockNodeIndex = [block.col, block.row];
    if (this.searched[blockNodeIndex]) {
      return;
    }

    this.searched[blockNodeIndex] = true;
    this.currentIteration.push(block);

    var adjacent = this.getAdjacentOfSameColor(block);
    for (var i = 0; i < adjacent.length; i++) {
      var nodeIndex = [adjacent[i].col, adjacent[i].row];

      if (!this.searched[nodeIndex]) {
        this.searchNode(adjacent[i]);
      }
    }
  };

  Searcher.prototype.validBlock = function (i, j) {
    return i >= 0 && i < this.columns.length &&
           j >= 0 && j < this.columns[i].length;
  };

  Searcher.prototype.getAdjacent = function (block) {
    var adjacent = [], i = block.col, j = block.row;

    if (this.validBlock(i, j + 1)) {
      adjacent.push(this.columns[i][j + 1]);
    }

    if (this.validBlock(i + 1, j)) {
      adjacent.push(this.columns[i + 1][j]);
    }

    if (this.validBlock(i, j - 1)) {
      adjacent.push(this.columns[i][j - 1]);
    }

    if (this.validBlock(i - 1, j)) {
      adjacent.push(this.columns[i - 1][j]);
    }

    return adjacent;
  };

  Searcher.prototype.getAdjacentOfSameColor = function (block) {
    return this.getAdjacent(block).filter(function (adjBlock) {
      return adjBlock.color === block.color;
    });
  };
});