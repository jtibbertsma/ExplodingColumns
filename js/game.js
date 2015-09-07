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

    this.dropQueue = new Columns.DropQueue({
      onComplete: this.nextIteration.bind(this)
    });
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
    this.clearKeyPresses();
    this.columns = [];

    for (i = 0; i < this.numColumns; i++) {
      this.columns.push([]);
    }

    this.descentSpeed = 2;
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
    this.descentSpeed++;
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

  Game.prototype.executePendingActions = function () {
    if (this.keyPresses.p) {

    }

    else if (this.keyPresses.a) {
      if (this.pair.maybeMoveLeft()) {
        this.keyPresses.a -= 1;
      } else {
        this.keyPresses.a = 0;
      }
    }

    else if (this.keyPresses.d) {
      if (this.pair.maybeMoveRight()) {
        this.keyPresses.d -= 1;
      } else {
        this.keyPresses.d = 0;
      }
    }

    else if (this.keyPresses.s) {
      this.killInterval = true;
      this.pair.drop();
    }

    else if (this.keyPresses.w) {
      if (this.pair.maybeRotate()) {
        this.keyPresses.w -= 1;
      } else {
        this.keyPresses.w = 0;
      }
    }
  };

  Game.prototype.handleCombo = function () {
    if (this.combo > 1) {
      this.descentSpeed -= 1;
      if (this.descentSpeed < 2) {
        this.descentSpeed = 2;
      }
    }
    this.combo = 0;
  };

  Game.prototype.doNextTurn = function () {
    this.clearKeyPresses();

    if (++this.turnNumber % 30 === 0) {
      this.raiseDifficulty();
    }

    if (this.turnNumber % 10 === 0) {
      this.avalanch(); // async
      return;
    }

    this.nextPair();
  };

  Game.prototype.maybeExplode = function () {
    var tilesToExplode = Columns.searchForExplosions(this);

    if (tilesToExplode.length > 0) {
      this.combo += 1;
      Columns.explodeTiles(this, tilesToExplode); // async
      return true;
    }

    return false;
  };

  Game.prototype.nextIteration = function () {
    this.killInterval = false;

    if (this.maybeExplode()) {
      return;
    }

    this.handleCombo();
    if (!this.gameOver()) {
      this.doNextTurn();
    } else {
      var callback = this.stopCallback;

      callback("Game Over", "Play Again?");
    }
  };

  Game.prototype.nextPair = function () {
    this.pair = new Columns.Pair({
      game: this,
      color1: this.randomColor(),
      color2: this.randomColor(),
      startCol: this.startCol,
      descentSpeed: this.descentSpeed
    });

    this.descend();
  };

  Game.prototype.descend = function () {
    this.descentInterval = setInterval(function () {
      this.executePendingActions();

      if (this.killInterval) {
        clearInterval(this.descentInterval);
      }

      else if (this.pair.canDescend()) {
        this.pair.moveDown();
        this.canvas.renderAll();
      }

      else {
        clearInterval(this.descentInterval);
        setTimeout(this.nextIteration.bind(this), 0);
      }
    }.bind(this), 1000 / 60);
  };
});