$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var Block = Columns.Block = function (options) {
    this.color = options.color;
    this.view = options.view;
    this.col = options.startCol;
    this.fallTo = this.calculateFallTo();
    this.fallSpeed = 2; // pixels per frame
    this.dropSpeed = 10;

    this.rect = new fabric.Rect({
      top: -20,
      left: this.col * 20,
      height: 20,
      width: 20,
      fill: this.color
    });

    this.view.canvas.add(this.rect);
  };

  // actions
  // 1: move left
  // 2: move right
  // 3: drop
  // 4: rotate

  Block.prototype.doAction = function () {
    var action = this.pendingAction;
    this.pendingAction = null;

    switch (action) {
      case 1:
        this.moveAndContinueFalling(-1);
        break
      case 2:
        this.moveAndContinueFalling(1);
        break;
    }
  };

  Block.prototype.checkForPendingActions = function () {
    if (this.view.keyPresses.a && this.canMoveLeft()) {
      this.view.keyPresses.a -= 1;
      this.pendingAction = 1;

      return true;
    }

    if (this.view.keyPresses.d && this.canMoveRight()) {
      this.view.keyPresses.d -= 1;
      this.pendingAction = 2;

      return true;
    }

    return false;
  };

  Block.prototype.canMoveLeft = function () {
    var _canMove = this.canMove(-1);
    if (!_canMove) {
      this.view.keyPresses.a = 0;
    }

    return _canMove;
  };

  Block.prototype.canMoveRight = function () {
    var _canMove = this.canMove(1);
    if (!_canMove) {
      this.view.keyPresses.d = 0;
    }

    return _canMove;
  };

  Block.prototype.canMove = function(dir) {
    var newCol = this.col + dir;

    if (newCol < 0 || newCol >= this.view.columns.length) {
      return false;
    }

    var bottomHeight = this.rect.top + 20;
    var colHeight = this.view.height - this.view.columns[newCol].length * 20;

    return bottomHeight < colHeight;
  };

  Block.prototype.moveAndContinueFalling = function (dir) {
    this.col += dir;
    this.rect.set({left: this.col * 20});
    this.fallTo = this.calculateFallTo();
  };

  Block.prototype.timeToStop = function () {
    if (this.rect.top > this.fallTo) {
      this.rect.set('top', this.fallTo);
      this.view.columns[this.col].push(this);
      return true;
    }

    return false;
  };

  Block.prototype.moveDown = function () {
    this.rect.set('top', this.rect.top + this.fallSpeed);
  };

  Block.prototype.startFalling = function () {
    this._interval = setInterval(function () {
      if (this.checkForPendingActions()) {
        this.doAction();
      }
      if (this.timeToStop()) {
        clearInterval(this._interval);
        this.view.canvas.fire("nextIteration");
      }
      this.moveDown();
      this.view.canvas.renderAll();
    }.bind(this), 1000 / 60);
  };

  Block.prototype.calculateFallTo = function () {
    var blocksInCol = this.view.columns[this.col].length;
    return (this.view.height - 20) - blocksInCol * 20;
  };
});