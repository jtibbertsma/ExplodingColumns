$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Clock = Columns.Clock = function (options) {
    this.game = options.game;
    this.$clock = $(options.clockSelector);

    this.game.updateClockCallback = this.setClock.bind(this);
  };

  Clock.prototype.format = function (time) {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;

    return "" + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  Clock.prototype.setClock = function (time) {
    this.$clock.text(this.format(time || this.game.countdown));
  };

  Clock.prototype.tick = function () {
    if (this.game.countdown > 0) {
      --this.game.countdown;
      this.setClock();
    }
  };

  Clock.prototype.finalCountdown = function () {
    var score = this.game.score;
    var countdown = this.game.countdown;
    this.game.score += this.game.countdown;
    this.game.countdown = 0;

    this.interval = setInterval(function () {
      this.setClock(--countdown);
      $("#score").text(++score);  // refactor

      if (countdown === 0) {
        this.stop();
      }
    }.bind(this), 1000 / 30);
  };

  Clock.prototype.start = function () {
    this.interval = setInterval(this.tick.bind(this), 1000);
  };

  Clock.prototype.stop = function () {
    clearInterval(this.interval);
  };
});