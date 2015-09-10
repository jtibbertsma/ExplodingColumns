$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Pair = Columns.Pair = function (options) {
    this.game = options.game;
    this.doneDescending = false;
    this.descentSpeed = options.descentSpeed;

    this.primaryTile = new Columns.Tile({
      color: options.color1,
      top: -40,
      game: this.game,
      col: options.startCol
    });

    this.secondaryTile = new Columns.Tile({
      color: options.color2,
      top: -20,
      game: this.game,
      col: options.startCol
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
      if (this.primaryTile.canMoveRight()) {
        return true;
      } else if (this.primaryTile.canMoveLeft()) {
        this.moveLeft();
        return true;
      } else {
        return false;
      }
    }

    // rotate left
    else {
      if (this.primaryTile.canMoveLeft()) {
        return true;
      } else if (this.primaryTile.canMoveRight()) {
        this.moveRight();
        return true;
      } else {
        return false;
      }
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

  Pair.prototype.moveLeft = function () {
    this.primaryTile.moveInDir(-1);
    this.secondaryTile.moveInDir(-1);
  };

  Pair.prototype.moveRight = function () {
    this.primaryTile.moveInDir(1);
    this.secondaryTile.moveInDir(1);
  };

  Pair.prototype.maybeMoveLeft = function () {
    if (this.canMoveLeft()) {
      this.moveLeft();
      return true;
    }

    return false;
  };

  Pair.prototype.maybeMoveRight = function () {
    if (this.canMoveRight()) {
      this.moveRight();
      return true;
    }

    return false;
  };

  Pair.prototype.maybeRotate = function () {
    if (this.canRotate()) {
      this.rotate();
      return true;
    }

    return false;
  };

  // This function is responsible for putting the tiles
  // in their proper resting postitions if were done falling.
  // The callback starts the next iteration of the main
  // game loop.
  Pair.prototype.canDescend = function (callback) {
    if (this.orientation === "vertical") {
      this.verticalCheck(callback);
    } else {
      this.horizontalCheck(callback);
    }

    return !this.doneDescending;
  };

  Pair.prototype.verticalCheck = function (callback) {
    if (this.bottomTile.finishedDescending()) {
      setTimeout(callback, 0);
      this.bottomTile.stop();
      this.topTile.stop();

      this.doneDescending = true;
    }
  };

  Pair.prototype.horizontalCheck = function (callback) {
    var left = this.leftTile.finishedDescending();
    var right = this.rightTile.finishedDescending();

    if (left && right) {
      setTimeout(callback, 0);
      this.leftTile.stop();
      this.rightTile.stop();

      this.doneDescending = true;

    } else if (left) {
      this.breakPair(this.rightTile, this.leftTile, callback);
    } else if (right) {
      this.breakPair(this.leftTile, this.rightTile, callback);
    }
  };

  Pair.prototype.breakPair = function (dropTile, stopTile, callback) {
    stopTile.stop();
    setTimeout(dropTile.drop.bind(dropTile, {
      onComplete: callback,
      topOffset: 0
    }), 150);

    this.doneDescending = true;
  };

  Pair.prototype.moveDown = function () {
    this.primaryTile.jump(this.descentSpeed);
    this.secondaryTile.jump(this.descentSpeed);
  };
});