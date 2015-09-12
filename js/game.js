$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Game = Columns.Game = function (options) {
    this.canvas = options.canvas;
    this.canvas.clear();

    this.stopCallback = options.stopCallback;
    this.updateScoreCallback = options.updateScoreCallback;
    this.iterationCallback = this.nextIteration.bind(this);

    this.keyPresses = options.keyPresses;
    this.numberToExplode = 4;

    this.numColumns = this.canvas.width / 20;
    this.startCol = Math.floor(this.numColumns / 2);
    this.colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];

    this.dropQueue = new Columns.DropQueue({
      onComplete: this.iterationCallback
    });

    this.clearKeyPresses();
    this.keyPresses.p = 0;
    this.columns = [];

    for (var i = 0; i < this.numColumns; i++) {
      this.columns.push([]);
    }

    this.descentSpeed = 2;
    this.turnNumber = 0;
    this.combo = 0;
    this.countdown = 45;
    this.score = 0;
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
    this.updateScoreCallback();
    this.updateClockCallback();

    this.nextPair();
  };

  Game.prototype.unpause = function () {
    this.paused = false;
    this.killInterval = false;
    this.keyPresses.p = 0;
    this.descend();
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

  Game.prototype.lowerDifficulty = function () {
    if (this.descentSpeed > 2) {
      this.descentSpeed--;
      this.countdown -= 60;
    }
  };

  Game.prototype.raiseDifficulty = function () {
    this.descentSpeed++;
    this.pair.descentSpeed++;
  };

  Game.prototype.avalanch = function () {
    for (var i = 0; i < this.numColumns; i++) {
      if (Math.random() > 0.5) {
        this.addToDropQueue(new Columns.Tile({
          color: 'gray',
          top: -20,
          col: i,
          game: this
        }));
      }
    }

    setTimeout(this.executeDrop.bind(this), 0);
  };

  Game.prototype.maybeExplode = function () {
    var tilesToExplode = Columns.searchForExplosions(this);

    if (tilesToExplode.length > 0) {
      this.exploderCount += tilesToExplode.length;
      this.combo += 1;
      Columns.explodeTiles(this, tilesToExplode); // async
      return true;
    }

    return false;
  };

  Game.prototype.calculateScore = function () {
    var scoreAddition = this.exploderCount;

    if (this.combo > 1) {
      scoreAddition = Math.pow(scoreAddition, this.combo);
    }

    this.score += scoreAddition;
    this.updateScoreCallback();
  };

  Game.prototype.handleCombo = function () {
    if (this.combo > 1) {
      this.countdown += 45 * this.combo;
      this.lowerDifficulty();
      this.updateClockCallback();
    }
    this.combo = 0;
  };

  Game.prototype.nextIteration = function () {
    this.killInterval = false;

    if (this.maybeExplode()) {
      this.calculateScore();
      return;
    }

    this.exploderCount = 0;
    this.handleCombo();

    if (!this.gameOver()) {
      this.nextTurn();
    } else {
      this.stopCallback("Game Over", "Play Again?");
    }
  };

  Game.prototype.nextTurn = function () {
    this.clearKeyPresses();

    if (++this.turnNumber % 10 === 0) {
      this.avalanch(); // async
      return;
    }

    this.nextPair();
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

  Game.prototype.executePendingActions = function () {
    if (this.keyPresses.p) {
      this.paused = true;
      this.killInterval = true;
      this.stopCallback("Paused", "Unpause");
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

  Game.prototype.descend = function () {
    this.descentInterval = setInterval(function () {
      this.executePendingActions();

      if (this.killInterval) {
        clearInterval(this.descentInterval);
      }

      else if (this.pair.canDescend(this.iterationCallback)) {
        this.pair.moveDown();
        this.canvas.renderAll();
      }

      else {
        clearInterval(this.descentInterval);
      }
    }.bind(this), 1000 / 60);
  };
});