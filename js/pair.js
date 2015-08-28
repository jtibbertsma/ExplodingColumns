$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Pair = Columns.Pair = function (options) {
    this.view = options.view;
    this.fallSpeed = 2; // pixels per frame

    this.primaryBlock = new Columns.Block({
      color: options.color1,
      top: -40,
      view: this.view,
      col: options.startCol,
      fallSpeed: this.fallSpeed
    });

    this.secondaryBlock = new Columns.Block({
      color: options.color2,
      top: -20,
      view: this.view,
      col: options.startCol,
      fallSpeed: this.fallSpeed
    });

    this.topBlock = this.primaryBlock;
    this.bottomBlock = this.secondaryBlock;

    this.leftBlock = null;
    this.rightBlock = null;

    this.orientation = "vertical";
  };

  // actions
  // 1: move left
  // 2: move right
  // 3: drop
  // 4: rotate

  Pair.prototype.doAction = function () {
    var action = this.pendingAction;
    this.pendingAction = null;

    switch (action) {
      case 1:
        this.primaryBlock.moveLeftOrRight(-1);
        this.secondaryBlock.moveLeftOrRight(-1);
        break
      case 2:
        this.primaryBlock.moveLeftOrRight(1);
        this.secondaryBlock.moveLeftOrRight(1);
        break;
      case 3:
        this.killInterval = true;
        this.drop();
        break;
      case 4:
        this.rotate();
        break;
    }
  };

  Pair.prototype.checkForPendingActions = function () {
    // move left
    if (this.view.keyPresses.a && this.canMoveLeft()) {
      this.view.keyPresses.a -= 1;
      this.pendingAction = 1;

      return true;
    }

    // move right
    else if (this.view.keyPresses.d && this.canMoveRight()) {
      this.view.keyPresses.d -= 1;
      this.pendingAction = 2;

      return true;
    }

    // drop
    else if (this.view.keyPresses.s) {
      this.pendingAction = 3;
      return true;
    }

    // rotate
    else if (this.view.keyPresses.w) {
      if (this.canRotate()) {
        this.view.keyPresses.w -= 1;
        this.pendingAction = 4;

        return true;
      } else {
        this.view.keyPresses.w = 0;
      }
    }

    return false;
  };

  Pair.prototype.canMoveLeft = function () {
    if (this.orientation === "vertical") {
      return this.bottomBlock.canMoveLeft();
    } else {
      return this.leftBlock.canMoveLeft();
    }
  };

  Pair.prototype.canMoveRight = function () {
    if (this.orientation === "vertical") {
      return this.bottomBlock.canMoveRight();
    } else {
      return this.rightBlock.canMoveRight();
    }
  };

  Pair.prototype.canRotate = function () {
    if (this.orientation === "horizontal") {
      return true;
    }

    // rotate right
    if (this.bottomBlock === this.primaryBlock) {
      return this.primaryBlock.canMoveRight();
    }
    // rotate left
    else {
      return this.primaryBlock.canMoveLeft();
    }
  };

  Pair.prototype.rotateFromVertical = function () {
    if (this.bottomBlock === this.primaryBlock) {
      this.secondaryBlock.moveLeftOrRight(1);
      this.secondaryBlock.jump(20);

      this.leftBlock = this.primaryBlock;
      this.rightBlock = this.secondaryBlock;
    } else {
      this.secondaryBlock.moveLeftOrRight(-1);
      this.secondaryBlock.jump(-20);

      this.rightBlock = this.primaryBlock;
      this.leftBlock = this.secondaryBlock;
    }

    this.bottomBlock = null;
    this.topBlock = null;
    this.orientation = 'horizontal';
  };

  Pair.prototype.rotateFromHorizontal = function () {
    if (this.leftBlock === this.primaryBlock) {
      this.secondaryBlock.jump(20);
      this.secondaryBlock.moveLeftOrRight(-1);

      this.topBlock = this.primaryBlock;
      this.bottomBlock = this.secondaryBlock;
    } else {
      this.secondaryBlock.jump(-20);
      this.secondaryBlock.moveLeftOrRight(1);

      this.bottomBlock = this.primaryBlock;
      this.topBlock = this.secondaryBlock;
    }

    this.leftBlock = null;
    this.rightBlock = null;
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
    setInterval(function () {
      this.view.addToDropQueue(this.primaryBlock);
      this.view.addToDropQueue(this.secondaryBlock);
      this.view.executeDrop();
    }.bind(this), 0);
  };

  // If this returns true, stop the interval
  // This function is also responsible for putting the blocks
  // in their proper resting postitions
  // The callback fires an event at the canvas that causes the
  // next iteration of the main game loop to begin
  Pair.prototype.timeToStop = function (callback) {
    if (this.killInterval) {
      return true;
    }

    if (this.orientation === "vertical") {
      if (this.bottomBlock.timeToStop()) {
        setTimeout(callback, 0);
        this.bottomBlock.stop();
        this.topBlock.stop();
        return true;
      }
    } else {
      var left = this.leftBlock.timeToStop();
      var right = this.rightBlock.timeToStop();

      if (left && right) {
        setTimeout(callback, 0);
        this.leftBlock.stop();
        this.rightBlock.stop();

        return true;

      } else if (left) {
        this.leftBlock.stop();
        setTimeout(function () {
          this.rightBlock.drop({
            onComplete: callback,
            topOffset: 0
          });
        }.bind(this), 300);

        return true;

      } else if (right) {
        this.rightBlock.stop();
        setTimeout(function () {
          this.leftBlock.drop({
            onComplete: callback,
            topOffset: 0
          });
        }.bind(this), 300);

        return true;
      }
    }

    return false;
  };

  Pair.prototype.startFalling = function () {
    this._interval = setInterval(function () {
      if (this.checkForPendingActions()) {
        this.doAction();
      }
      if (this.timeToStop(function () {
        this.view.canvas.fire("nextIteration");
      }.bind(this))) {
        clearInterval(this._interval);
      } else {
        this.primaryBlock.moveDown();
        this.secondaryBlock.moveDown();
        this.view.canvas.renderAll();
      }
    }.bind(this), 1000 / 60);
  };
});