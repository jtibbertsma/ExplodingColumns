$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Pair = Columns.Pair = function (options) {
    this.game = options.game;
    this.fallSpeed = options.fallSpeed; // pixels per frame
    this.doneFalling = false;

    this.primaryTile = new Columns.Tile({
      color: options.color1,
      top: -40,
      game: this.game,
      col: options.startCol,
      fallSpeed: this.fallSpeed
    });

    this.secondaryTile = new Columns.Tile({
      color: options.color2,
      top: -20,
      game: this.game,
      col: options.startCol,
      fallSpeed: this.fallSpeed
    });

    this.topTile = this.primaryTile;
    this.bottomTile = this.secondaryTile;

    this.leftTile = null;
    this.rightTile = null;

    this.orientation = "vertical";
  };

  Pair.prototype.canMoveLeft = function () {
    if (this.orientation === "vertical") {
      return this.bottomTile.canMoveLeft();
    } else {
      return this.leftTile.canMoveLeft();
    }
  };

  Pair.prototype.canMoveRight = function () {
    if (this.orientation === "vertical") {
      return this.bottomTile.canMoveRight();
    } else {
      return this.rightTile.canMoveRight();
    }
  };

  Pair.prototype.canRotate = function () {
    if (this.orientation === "horizontal") {
      return true;
    }

    // rotate right
    if (this.bottomTile === this.primaryTile) {
      return this.primaryTile.canMoveRight();
    }
    // rotate left
    else {
      return this.primaryTile.canMoveLeft();
    }
  };

  Pair.prototype.rotateFromVertical = function () {
    if (this.bottomTile === this.primaryTile) {
      this.secondaryTile.moveInDir(1);
      this.secondaryTile.jump(20);

      this.leftTile = this.primaryTile;
      this.rightTile = this.secondaryTile;
    } else {
      this.secondaryTile.moveInDir(-1);
      this.secondaryTile.jump(-20);

      this.rightTile = this.primaryTile;
      this.leftTile = this.secondaryTile;
    }

    this.bottomTile = null;
    this.topTile = null;
    this.orientation = 'horizontal';
  };

  Pair.prototype.rotateFromHorizontal = function () {
    if (this.leftTile === this.primaryTile) {
      this.secondaryTile.jump(20);
      this.secondaryTile.moveInDir(-1);

      this.topTile = this.primaryTile;
      this.bottomTile = this.secondaryTile;
    } else {
      this.secondaryTile.jump(-20);
      this.secondaryTile.moveInDir(1);

      this.bottomTile = this.primaryTile;
      this.topTile = this.secondaryTile;
    }

    this.leftTile = null;
    this.rightTile = null;
    this.orientation = 'vertical';
  };

  Pair.prototype.rotate = function () {
    if (this.orientation === 'vertical') {
      this.rotateFromVertical();
    } else {
      this.rotateFromHorizontal();
    }
  };

  Pair.prototype.drop = function () {
    setTimeout(function () {
      this.game.addToDropQueue(this.bottomTile || this.leftTile);
      this.game.addToDropQueue(this.topTile || this.rightTile);
      this.game.executeDrop();
    }.bind(this), 0);
  };

  Pair.prototype.executePendingActions = function () {
    // move left
    if (this.game.keyPresses.a && this.canMoveLeft()) {
      this.game.keyPresses.a -= 1;

      this.primaryTile.moveInDir(-1);
      this.secondaryTile.moveInDir(-1);
    }

    // move right
    else if (this.game.keyPresses.d && this.canMoveRight()) {
      this.game.keyPresses.d -= 1;

      this.primaryTile.moveInDir(1);
      this.secondaryTile.moveInDir(1);
    }

    // drop
    else if (this.game.keyPresses.s) {
      this.killInterval = true;
      this.drop();
    }

    // rotate
    else if (this.game.keyPresses.w) {
      if (this.canRotate()) {
        this.game.keyPresses.w -= 1;

        this.rotate();
      } else {
        this.game.keyPresses.w = 0;
      }
    }
  };

  // This function is responsible for putting the tiles
  // in their proper resting postitions if were done falling.
  // The callback fires an event at the canvas that causes the
  // next iteration of the main game loop to begin.
  Pair.prototype.stopIfFinished = function (callback) {
    if (this.killInterval) {
      this.doneFalling = true;
      clearInterval(this._interval);
      return;
    }

    if (this.orientation === "vertical") {
      this.verticalCheck(callback);
    } else {
      this.horizontalCheck(callback);
    }

    if (this.doneFalling) {
      clearInterval(this._interval);
    }
  };

  Pair.prototype.verticalCheck = function (callback) {
    if (this.bottomTile.finishedFalling()) {
      setTimeout(callback, 0);
      this.bottomTile.stop();
      this.topTile.stop();

      this.doneFalling = true;
    }
  };

  Pair.prototype.horizontalCheck = function (callback) {
    var left = this.leftTile.finishedFalling();
    var right = this.rightTile.finishedFalling();

    if (left && right) {
      setTimeout(callback, 0);
      this.leftTile.stop();
      this.rightTile.stop();

      this.doneFalling = true;

    } else if (left) {
      this.breakPair(this.rightTile, this.leftTile, callback);
    } else if (right) {
      this.breakPair(this.leftTile, this.rightTile, callback);
    }
  };

  Pair.prototype.breakPair = function (dropTile, stopTile, callback) {
    stopTile.stop();
    setTimeout(function () {
      dropTile.drop({
        onComplete: callback,
        topOffset: 0
      });
    }.bind(this), 150);

    this.doneFalling = true;
  };

  Pair.prototype.fall = function () {
    this._interval = setInterval(function () {
      this.executePendingActions();

      this.stopIfFinished(function () {
        this.game.canvas.fire("nextIteration");
      }.bind(this));

      if (!this.doneFalling) {
        this.primaryTile.moveDown();
        this.secondaryTile.moveDown();
        this.game.canvas.renderAll();
      }
    }.bind(this), 1000 / 60);
  };
});