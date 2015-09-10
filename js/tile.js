$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Tile = Columns.Tile = function (options) {
    this.color = options.color;
    this.dropSpeed = 0.3;
    this.game = options.game;
    this.col = options.col;
    this.canvas = this.game.canvas;

    this.rect = new fabric.Rect({
      top: options.top,
      left: this.col * 20,
      height: 20,
      width: 20,
      fill: this.color
    });

    this.descendTo = this.calculateDescendTo();
    this.canvas.add(this.rect);
  };

  Tile.prototype.canMoveLeft = function () {
    return this.canMove(-1);
  };

  Tile.prototype.canMoveRight = function () {
    return this.canMove(1);
  };

  Tile.prototype.canMove = function(dir) {
    var newCol = this.col + dir;

    if (newCol < 0 || newCol >= this.game.columns.length) {
      return false;
    }

    var bottomHeight = this.rect.top + 20;
    var colHeight = this.canvas.height - this.game.columns[newCol].length * 20;

    return bottomHeight < colHeight;
  };

  Tile.prototype.moveInDir = function (dir) {
    this.col += dir;
    this.rect.set({left: this.col * 20});
    this.descendTo = this.calculateDescendTo();
  };

  Tile.prototype.finishedDescending = function () {
    return this.rect.top > this.descendTo;
  };

  Tile.prototype.jump = function (distance) {
    this.rect.set('top', this.rect.top + distance);
  };

  Tile.prototype.stop = function () {
    this.descendTo = this.calculateDescendTo();
    this.rect.set('top', this.descendTo);
    this.game.columns[this.col].push(this);
    this.row = this.game.columns[this.col].length - 1;
  };

  Tile.prototype.calculateDescendTo = function () {
    var tilesInCol = this.game.columns[this.col].length;
    return (this.canvas.height - 20) - tilesInCol * 20;
  };

  Tile.prototype.explode = function () {
    var numFlashes = 6;
    var color = this.color;

    this._flashInterval = setInterval(function () {
      this.rect.set('fill', this.rect.fill === color ? "white" : color);
      if (--numFlashes === 0) {
        clearInterval(this._flashInterval);
        this.canvas.remove(this.rect);
        this.canvas.fire("doneExploding");
      }
      this.canvas.renderAll();
    }.bind(this), 40);
  };

  Tile.prototype.drop = function (options) {
    this.descendTo = this.calculateDescendTo();

    var callback = options.onComplete;
    var distance = (this.descendTo + options.topOffset) - this.rect.top;

    var duration = distance / this.dropSpeed;

    this.rect.animate("top", this.descendTo + options.topOffset, {
      duration: duration,
      onChange: this.canvas.renderAll.bind(this.canvas),
      easing: fabric.util.ease.easeOutBounce,
      onComplete: function () {
        this.stop();
        callback();
      }.bind(this)
    });
  };
});