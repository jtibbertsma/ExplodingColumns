$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var Clock = Columns.Clock = function (options) {
    this.game = options.game;
    this.$clock = options.$clock;

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
    } else {
      this.game.countdown = 45;
      this.game.raiseDifficulty();
    }

    this.setClock();
  };

  Clock.prototype.start = function () {
    this.interval = setInterval(this.tick.bind(this), 1000);
  };

  Clock.prototype.stop = function () {
    clearInterval(this.interval);
  };

  Clock.prototype.finalCountdown = function ($score) {
    var score = this.game.score;
    var countdown = this.game.countdown;
    this.game.score += this.game.countdown;
    this.game.countdown = 0;

    this.interval = setInterval(function () {
      this.setClock(--countdown);
      $score.text(++score);

      if (countdown === 0) {
        this.stop();
      }
    }.bind(this), 1000 / 30);
  };
});