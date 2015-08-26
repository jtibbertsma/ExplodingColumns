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
    this.startCol = 11;
    this.colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];

    for (i = 0; i < this.numColumns; i++) {
      this.columns.push([]);
    }

    this.keyPresses = {
      w: 0,
      a: 0,
      s: 0,
      d: 0
    };

    Columns.bindKeys(this.keyPresses);
  };

  GameView.prototype.randomColor = function () {
    return this.colors[Math.floor(Math.random()*this.colors.length)];
  },

  GameView.prototype.start = function () {
    this._running = true;
    this.canvas.on("nextIteration", this.nextIteration.bind(this));
    this.nextBlock();
  };

  GameView.prototype.gameOver = function () {
    return this.columns[this.startCol].length * 20 === this.height;
  },

  GameView.prototype.nextIteration = function () {
    if (!this.gameOver()) {
      this.nextBlock();
    } else {
      console.log("gameOver");
    }
  },

  GameView.prototype.nextBlock = function () {
    this.currentBlock = new Columns.Block({
      view: this,
      color: this.randomColor(),
      startCol: this.startCol
    });
    this.currentBlock.startFalling();
  };
});