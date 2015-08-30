$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Pair = Columns.Pair = function (options) {
    this.view = options.view;
    this.fallSpeed = 2; // pixels per frame
    this.doneFalling = false;

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
      this.secondaryBlock.moveInDir(1);
      this.secondaryBlock.jump(20);

      this.leftBlock = this.primaryBlock;
      this.rightBlock = this.secondaryBlock;
    } else {
      this.secondaryBlock.moveInDir(-1);
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
      this.secondaryBlock.moveInDir(-1);

      this.topBlock = this.primaryBlock;
      this.bottomBlock = this.secondaryBlock;
    } else {
      this.secondaryBlock.jump(-20);
      this.secondaryBlock.moveInDir(1);

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
    setTimeout(function () {
      this.view.addToDropQueue(this.bottomBlock || this.leftBlock);
      this.view.addToDropQueue(this.topBlock || this.rightBlock);
      this.view.executeDrop();
    }.bind(this), 0);
  };

  Pair.prototype.executePendingActions = function () {
    // move left
    if (this.view.keyPresses.a && this.canMoveLeft()) {
      this.view.keyPresses.a -= 1;

      this.primaryBlock.moveInDir(-1);
      this.secondaryBlock.moveInDir(-1);
    }

    // move right
    else if (this.view.keyPresses.d && this.canMoveRight()) {
      this.view.keyPresses.d -= 1;

      this.primaryBlock.moveInDir(1);
      this.secondaryBlock.moveInDir(1);
    }

    // drop
    else if (this.view.keyPresses.s) {
      this.killInterval = true;
      this.drop();
    }

    // rotate
    else if (this.view.keyPresses.w) {
      if (this.canRotate()) {
        this.view.keyPresses.w -= 1;

        this.rotate();
      } else {
        this.view.keyPresses.w = 0;
      }
    }
  };

  // This function is responsible for putting the blocks
  // in their proper resting postitions if were done falling.
  // The callback fires an event at the canvas that causes the
  // next iteration of the main game loop to begin.
  Pair.prototype.stopIfFinished = function (callback) {
    if (this.killInterval) {
      this.doneFalling = true;
      return;
    }

    if (this.orientation === "vertical") {
      if (this.bottomBlock.finishedFalling()) {
        setTimeout(callback, 0);
        this.bottomBlock.stop();
        this.topBlock.stop();

        this.doneFalling = true;
      }
    } else {
      var left = this.leftBlock.finishedFalling();
      var right = this.rightBlock.finishedFalling();

      if (left && right) {
        setTimeout(callback, 0);
        this.leftBlock.stop();
        this.rightBlock.stop();

        this.doneFalling = true;

      } else if (left) {
        this.leftBlock.stop();
        setTimeout(function () {
          this.rightBlock.drop({
            onComplete: callback,
            topOffset: 0
          });
        }.bind(this), 150);

        this.doneFalling = true;

      } else if (right) {
        this.rightBlock.stop();
        setTimeout(function () {
          this.leftBlock.drop({
            onComplete: callback,
            topOffset: 0
          });
        }.bind(this), 150);

        this.doneFalling = true;
      }
    }

    if (this.doneFalling) {
      clearInterval(this._interval);
    }
  };

  Pair.prototype.fall = function () {
    this._interval = setInterval(function () {
      this.executePendingActions();

      this.stopIfFinished(function () {
        this.view.canvas.fire("nextIteration");
      }.bind(this));

      if (!this.doneFalling) {
        this.primaryBlock.moveDown();
        this.secondaryBlock.moveDown();
        this.view.canvas.renderAll();
      }
    }.bind(this), 1000 / 60);
  };
});