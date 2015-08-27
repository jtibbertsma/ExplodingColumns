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

  Pair.prototype.timeToStop = function () {
    if (this.bottomBlock.timeToStop()) {
      this.bottomBlock.stop();
      this.topBlock.stop();
      return true;
    }

    return false;
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
      case 4:
        this.rotate();
        break;
    }
  };

  Pair.prototype.checkForPendingActions = function () {
    // move left
    if (this.view.keyPresses.a && this.bottomBlock.canMoveLeft()) {
      this.view.keyPresses.a -= 1;
      this.pendingAction = 1;

      return true;
    }

    // move right
    else if (this.view.keyPresses.d && this.bottomBlock.canMoveRight()) {
      this.view.keyPresses.d -= 1;
      this.pendingAction = 2;

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

  Pair.prototype.canRotate = function () {
    if (this.orientation === "horizontal") {
      return true;
    }

    // rotate right
    if (this.bottomBlock === this.primaryBlock) {
      return this.primaryBlock.canMoveRight();
    } else {
      return this.primaryBlock.canMoveLeft();
    }
  };

  Pair.prototype.rotate = function () {
    this.primaryBlock.primaryRotation();
    this.secondaryBlock.secondaryRotation();
  };

  Pair.prototype.startFalling = function () {
    this._interval = setInterval(function () {
      if (this.checkForPendingActions()) {
        this.doAction();
      }
      if (this.timeToStop()) {
        clearInterval(this._interval);
        this.view.canvas.fire("nextIteration");
      }
      this.primaryBlock.moveDown();
      this.secondaryBlock.moveDown();
      this.view.canvas.renderAll();
    }.bind(this), 1000 / 60);
  };
});