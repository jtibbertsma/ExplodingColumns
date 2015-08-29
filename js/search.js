$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  Columns.searchForExplosions = function (view) {
    var searcher = new Searcher(view);
    searcher.search();
  };

  var Searcher = function (view) {
    this.view = view;
    this.columns = view.columns;
    this.searched = {};
    this.exploders = [];
  };

  Searcher.prototype.search = function () {
    for (var i = 0; i < columns.length; i++) {
      for (var j = 0; j < columns[i].length; j++) {
        if (!this.searched[[i, j]]) {
          this.currentIteration = [];
          this.searchNode(columns[i][j]);
        }
      }
    }
  };

  Searcher.prototype.searchNode = function (block) {
    this.searched[[block.col, block.row]] = true;
    this.currentIteration.push(block);

    var color = block.color;
    var adjacent = this.getAdjacent(block);
    for (var i = 0; i < adjacent.length; i++) {
      
    }
  };
});