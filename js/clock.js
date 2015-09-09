$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Clock = Columns.Clock = function (options) {
    this.game = options.game;
    this.$clock = $(options.clockSelector);

    this.setClock();
  };

  Clock.prototype.format = function () {
    var minutes = Math.floor(this.game.countdown / 60);
    var seconds = this.game.countdown % 60;

    return "" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
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