$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var Block = Columns.Block = function (options) {
    this.color = options.color;
    this.view = options.view;
    this.col = 11;
    this.fallTo = this.calculateFallTo();
    this.fallDuration = this.calculateFallDuration();

    this.rect = new fabric.Rect({
      top: -20,
      left: 220,
      height: 20,
      width: 20,
      fill: this.color
    });

    this.view.canvas.add(this.rect);
  };

  Block.prototype.fall = function () {
    this.rect.animate('top', this.fallTo, {
      onChange: this.view.canvas.renderAll.bind(this.view.canvas),
      duration: this.fallDuration
    });
  };

  Block.prototype.calculateFallTo = function () {
    return this.view.canvas.height - 20;
  };

  Block.prototype.calculateFallDuration = function () {
    return 4000;
  }
});