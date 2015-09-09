$(function () {
  if (typeof Columns = "undefined") {
    Columns = {};
  }

  var Clock = Columns.Clock = function (options) {
    this.game = options.game;
    this.$clock = $("#clock");

    this.setClock();
  };

  Clock.prototype.format = function () {
    var time = this.game.countdown;

    return "" + Math.floor(time / 60) + ":" + time % 60;
  };

  Clock.prototype.setClock = function () {
    this.$clock.text(this.format());
  };

  Clock.prototype.tick = function () {
    if (this.game.countdown > 0) {
      --this.game.countdown;
      this.setClock();
    }
  };

  Clock.prototype.start = function () {
    this.interval = setInterval(this.tick.bind(this), 1000);
  };

  Clock.prototype.stop = function () {
    clearInterval(this.interval);
  };
});