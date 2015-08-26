$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var GameView = Columns.GameView = function (canvasId, width, height) {
    if (width % 20 || height % 20) {
      throw "Error";
    }

    this.canvas = new fabric.Canvas(canvasId);

    this.canvas.setWidth(width);
    this.canvas.setHeight(height);

    this.width = width;
    this.height = height;

    this.numColumns = width / 20;
    this.numRows = height / 20;
    this.columns = [];

    for (i = 0; i < this.numColumns; i++) {
      this.columns.push([]);
    }
  };

  GameView.prototype.start = function () {
    this._running = true;
    this.nextBlock();
  };

  GameView.prototype.nextBlock = function () {
    this.currentBlock = new Columns.Block({
      view: this,
      color: 'red'
    });
    this.currentBlock.fall();
  };
});