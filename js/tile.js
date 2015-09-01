$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var Tile = Columns.Tile = function (options) {
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

  Tile.prototype.canMoveLeft = function () {
    var _canMove = this.canMove(-1);
    if (!_canMove) {
      this.view.keyPresses.a = 0;
    }

    return _canMove;
  };

  Tile.prototype.canMoveRight = function () {
    var _canMove = this.canMove(1);
    if (!_canMove) {
      this.view.keyPresses.d = 0;
    }

    return _canMove;
  };

  Tile.prototype.canMove = function(dir) {
    var newCol = this.col + dir;

    if (newCol < 0 || newCol >= this.view.columns.length) {
      return false;
    }

    var bottomHeight = this.rect.top + 20;
    var colHeight = this.view.height - this.view.columns[newCol].length * 20;

    return bottomHeight < colHeight;
  };

  Tile.prototype.moveInDir = function (dir) {
    this.col += dir;
    this.rect.set({left: this.col * 20});
    this.fallTo = this.calculateFallTo();
  };

  Tile.prototype.finishedFalling = function () {
    // this.fallTo = this.calculateFallTo();
    if (this.rect.top > this.fallTo) {
      return true;
    }

    return false;
  };

  Tile.prototype.jump = function (distance) {
    this.rect.set('top', this.rect.top + distance);
  };

  Tile.prototype.stop = function () {
    this.fallTo = this.calculateFallTo();
    this.rect.set('top', this.fallTo);
    this.view.columns[this.col].push(this);
    this.row = this.view.columns[this.col].length - 1;
  };

  Tile.prototype.moveDown = function () {
    this.rect.set('top', this.rect.top + this.fallSpeed);
  };

  Tile.prototype.calculateFallTo = function () {
    var tilesInCol = this.view.columns[this.col].length;
    return (this.view.height - 20) - tilesInCol * 20;
  };

  Tile.prototype.explode = function () {
    var numFlashes = 6;
    var color = this.color;

    this._flashInterval = setInterval(function () {
      this.rect.set('fill', this.rect.fill === color ? "white" : color);
      if (--numFlashes === 0) {
        clearInterval(this._flashInterval);
        this.view.canvas.remove(this.rect);
        this.view.canvas.fire("doneExploding");
      }
      this.view.canvas.renderAll();
    }.bind(this), 40);
  };

  Tile.prototype.drop = function (options) {
    this.fallTo = this.calculateFallTo();

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