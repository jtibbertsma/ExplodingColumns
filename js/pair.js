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
  };

  Pair.prototype.timeToStop = function () {
    if (this.secondaryBlock.timeToStop()) {
      this.secondaryBlock.stop();
      this.primaryBlock.stop();
      return true;
    }

    return false;
  };

  Pair.prototype.startFalling = function () {
    this._interval = setInterval(function () {
      // if (this.checkForPendingActions()) {
      //   this.doAction();
      // }
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