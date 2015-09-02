$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Game = Columns.Game = function (options) {
    this.canvas = options.canvas;
    this.canvas.clear();

    this.stopCallback = options.stopCallback;

    this.keyPresses = options.keyPresses;
    this.numberToExplode = 4;
    this.avalanchRows = 1;

    this.numColumns = this.canvas.width / 20;
    this.startCol = Math.floor(this.numColumns / 2);
    this.colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];

    this.dropQueue = new Columns.DropQueue(this);
  };

  Game.prototype.clearKeyPresses = function () {
    this.keyPresses.a = 0;
    this.keyPresses.s = 0;
    this.keyPresses.w = 0;
    this.keyPresses.d = 0;
  };

  Game.prototype.randomColor = function () {
    return this.colors[Math.floor(Math.random()*this.colors.length)];
  };

  Game.prototype.play = function () {
    this.canvas.on("nextIteration", this.nextIteration.bind(this));

    this.clearKeyPresses();
    this.columns = [];

    for (i = 0; i < this.numColumns; i++) {
      this.columns.push([]);
    }

    this.fallSpeed = 2;
    this.turnNumber = 0;
    this.combo = 0;

    this.nextPair();
  };

  Game.prototype.gameOver = function () {
    return this.columns[this.startCol].length * 20 > this.canvas.height;
  };

  Game.prototype.addToDropQueue = function (tile) {
    this.dropQueue.add(tile);
  };

  Game.prototype.executeDrop = function () {
    this.dropQueue.executeDrop();
  };

  Game.prototype.raiseDifficulty = function () {
    // this.avalanchRows++;
    this.fallSpeed++;
  };

  Game.prototype.avalanch = function () {
    for (var i = 0; i < this.avalanchRows; i++) {
      for (var j = 0; j < this.numColumns; j++) {
        if (Math.random() > 0.5) {
          this.addToDropQueue(new Columns.Tile({
            color: 'gray',
            top: -20 - (i * 20),
            col: j,
            game: this
          }));
        }
      }
    }

    setTimeout(this.executeDrop.bind(this), 0);
  };

  Game.prototype.nextIteration = function () {
    this.clearKeyPresses();
    
    var tilesToExplode = Columns.searchForExplosions(this);

    if (tilesToExplode.length > 0) {
      this.combo += 1;
      Columns.explodeTiles(this, tilesToExplode); // async
      return;
    }

    if (this.combo > 1) {
      this.fallSpeed -= 1;
      if (this.fallSpeed < 2) {
        this.fallSpeed = 2;
      }
    }
    this.combo = 0;

    if (!this.gameOver()) {
      if (++this.turnNumber % 30 === 0) {
        this.raiseDifficulty();
      }

      if (this.turnNumber % 10 === 0) {
        this.avalanch(); // async
        return;
      }

      this.nextPair();
    } else {
      var callback = this.stopCallback;
      this.canvas.off("nextIteration");

      callback("Game Over", "Play Again?");
    }
  };

  Game.prototype.nextPair = function () {
    this.currentPair = new Columns.Pair({
      game: this,
      color1: this.randomColor(),
      color2: this.randomColor(),
      startCol: this.startCol,
      fallSpeed: this.fallSpeed
    });
    this.currentPair.fall();
  };
});