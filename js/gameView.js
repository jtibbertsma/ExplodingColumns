$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var GameView = Columns.GameView = function (canvasId, width, height) {
    if (width % 20 || height % 20) {
      throw "canvas width and height must be multiples of 20";
    }

    this.canvas = new fabric.Canvas(canvasId);

    this.canvas.setWidth(width);
    this.canvas.setHeight(height);

    this.width = width;
    this.height = height;

    this.numColumns = width / 20;
    // this.numRows = height / 20;
    this.columns = [];
    this.startCol = Math.floor(this.numColumns / 2);
    this.colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];

    for (i = 0; i < this.numColumns; i++) {
      this.columns.push([]);
    }

    this.dropQueue = {};
    this.keyPresses = {};
    this.clearKeyPresses();

    Columns.bindKeys(this.keyPresses);
  };

  GameView.prototype.clearKeyPresses = function () {
    this.keyPresses.a = 0;
    this.keyPresses.s = 0;
    this.keyPresses.w = 0;
    this.keyPresses.d = 0;
  };

  GameView.prototype.randomColor = function () {
    return this.colors[Math.floor(Math.random()*this.colors.length)];
  };

  GameView.prototype.start = function () {
    this.canvas.on("nextIteration", this.nextIteration.bind(this));
    this.nextPair();
  };

  GameView.prototype.gameOver = function () {
    return this.columns[this.startCol].length * 20 > this.height;
  };

  GameView.prototype.addToDropQueue = function (block) {
    if (typeof this.dropQueue[block.col] === "undefined") {
      this.dropQueue[block.col] = [];
    }

    this.dropQueue[block.col].push(block);
  };

  GameView.prototype.executeDrop = function () {
    var keys = this.getDropOrder(Object.keys(this.dropQueue));
    this.canvas.on("doneDropping", this.doneDropping.bind(this));
    this._pending = 0;

    for (var time = 0, i = 0; i < keys.length; time += 1000, i++) {
      setTimeout(this.dropColumn.bind(this, this.dropQueue[keys[i]]), time);
      this._pending += this.dropQueue[keys[i]].length;
    }
  };

  GameView.prototype.dropColumn = function (blocks) {
    for (var time = 0, i = 0, offset = 0;
            i < blocks.length; time += 30, offset -= 20, i++) {
      setTimeout(blocks[i].drop.bind(blocks[i], {
        topOffset: offset,
        onComplete: function () {
          this.canvas.fire("doneDropping");
        }.bind(this)
      }), time);
    }
  };

  // The goal here is to drop columns starting with the middle, and then
  // working our way out.
  GameView.prototype.getDropOrder = function (keys) {
    var dropOrder = [];

    while (keys.length > 0) {
      var nextKey = Math.floor(keys.length / 2);
      dropOrder.push(keys[nextKey]);
      keys.splice(nextKey, 1);
    }

    return dropOrder;
  };

  GameView.prototype.doneDropping = function () {
    --this._pending;
    if (this._pending === 0) {
      this.canvas.off("doneDropping");
      this.dropQueue = {};
      this.nextIteration();
    }
  };

  GameView.prototype.nextIteration = function () {
    console.log(this.keyPresses);
    this.clearKeyPresses();
    if (!this.gameOver()) {
      this.nextPair();
    } else {
      this.canvas.off("nextIteration");
      console.log("gameOver");
    }
  };

  GameView.prototype.nextPair = function () {
    var currentPair = new Columns.Pair({
      view: this,
      color1: this.randomColor(),
      color2: this.randomColor(),
      startCol: this.startCol
    });
    currentPair.startFalling();
  };
});