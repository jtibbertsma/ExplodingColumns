$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var Block = Columns.Block = function (options) {
    this.color = options.color;
    this.view = options.view;
    this.col = options.startCol;
    this.fallTo = this.calculateFallTo();
    this.speed = 0.1; // pixels per millisecond

    this.rect = new fabric.Rect({
      top: -20,
      left: this.col * 20,
      height: 20,
      width: 20,
      fill: this.color
    });

    this.fallDuration = this.calculateFallDuration();
    this.view.canvas.add(this.rect);
  };

  Block.prototype.startFalling = function () {
    this.rect.animate('top', this.fallTo, {
      onChange: this.view.canvas.renderAll.bind(this.view.canvas),
      duration: this.fallDuration,

      onComplete: function () {
        if (this.rect.top <= this.fallTo) {
          console.log("ping");
          this.view.columns[this.col].push(this);
          this.view.canvas.fire("nextIteration");
        }
      }.bind(this)
    });
  };

  Block.prototype.calculateFallTo = function () {
    var blocksInCol = this.view.columns[this.col].length;
    return (this.view.height - 20) - blocksInCol * 20;
  };

  Block.prototype.calculateFallDuration = function () {
    // v = d/t
    var distance = this.fallTo - this.rect.top;
    return distance / this.speed;
  };
});