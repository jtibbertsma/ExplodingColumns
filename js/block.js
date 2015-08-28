$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var Block = Columns.Block = function (options) {
    this.color = options.color;
    this.dropSpeed = 0.3;
    this.fallSpeed = options.fallSpeed;
    this.view = options.view;
    this.col = options.col;

    this.rect = new fabric.Rect({
      top: options.top,
      left: this.col * 20,
      height: 20,
      width: 20,
      fill: this.color
    });

    this.fallTo = this.calculateFallTo();
    this.view.canvas.add(this.rect);
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

  Block.prototype.moveLeftOrRight = function (dir) {
    this.col += dir;
    this.rect.set({left: this.col * 20});
    this.fallTo = this.calculateFallTo();
  };

  Block.prototype.timeToStop = function () {
    // this.fallTo = this.calculateFallTo();
    if (this.rect.top > this.fallTo) {
      return true;
    }

    return false;
  };

  Block.prototype.jump = function (distance) {
    this.rect.set('top', this.rect.top + distance);
  };

  Block.prototype.stop = function () {
    this.fallTo = this.calculateFallTo();
    this.rect.set('top', this.fallTo);
    this.view.columns[this.col].push(this);
  };

  Block.prototype.moveDown = function () {
    this.rect.set('top', this.rect.top + this.fallSpeed);
  };

  Block.prototype.calculateFallTo = function () {
    var blocksInCol = this.view.columns[this.col].length;
    return (this.view.height - 20) - blocksInCol * 20;
  };

  Block.prototype.drop = function (options) {
    var callback = options.onComplete;
    var distance = (this.fallTo + options.topOffset) - this.rect.top;

    var duration = distance / this.dropSpeed;

    this.rect.animate("top", this.fallTo + options.topOffset, {
      duration: duration,
      onChange: this.view.canvas.renderAll.bind(this.view.canvas),
      easing: fabric.util.ease.easeOutBounce,
      onComplete: function () {
        this.stop();
        callback();
      }.bind(this)
    });
  };
});