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

    this.keyPresses = {};
    this.clearKeyPresses();

    Columns.bindKeys(this.keyPresses);
  };

  GameView.prototype.clearKeyPresses = function () {
    this.keyPresses.a = 0;
    this.keyPresses.s = 0;
    this.keyPresses.w = 0;
    this.keyPresses.d = 0;
  },

  GameView.prototype.randomColor = function () {
    return this.colors[Math.floor(Math.random()*this.colors.length)];
  },

  GameView.prototype.start = function () {
    this._running = true;
    this.canvas.on("nextIteration", this.nextIteration.bind(this));
    this.nextPair();
  };

  GameView.prototype.gameOver = function () {
    return this.columns[this.startCol].length * 20 > this.height;
  },

  GameView.prototype.nextIteration = function () {
    console.log(this.keyPresses);
    this.clearKeyPresses();
    if (!this.gameOver()) {
      this.nextPair();
    } else {
      this.canvas.off("nextIteration");
      console.log("gameOver");
    }
  },

  GameView.prototype.nextPair = function () {
    this.currentPair = new Columns.Pair({
      view: this,
      color1: this.randomColor(),
      color2: this.randomColor(),
      startCol: this.startCol
    });
    this.currentPair.startFalling();
  };
});