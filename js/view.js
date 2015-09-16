$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var View = Columns.View = function (options) {
    if (options.canvasWidth && options.canvasWidth % 20) {
      throw "canvas width must be a multiple of 20";
    }

    this.canvas = new fabric.Canvas(options.canvasId);

    this.canvas.setWidth(options.canvasWidth);
    this.canvas.setHeight(options.canvasHeight);

    this.keyPresses = { p: 0, a: 0, w: 0, s: 0, d: 0 };
    Columns.bindKeys(this.keyPresses);

    this.buildOverlay();
    this.addOverlayContent("Welcome", "Play Game");

    this.$score = $(options.scoreSelector);
    this.$clock = $(options.clockSelector);
    this.$combo = $(options.comboSelector);
  };

  View.prototype.buildOverlay = function () {
    // the .canvas-container div is created by the fabric library when creating
    // a new fabric.Canvas object
    var $canvasContainer = $(".canvas-container");

    this.$transparent = $("<div>").addClass("transparent");
    this.$overlay = $("<div>").addClass("overlay");

    $canvasContainer.append(this.$transparent);
    $canvasContainer.append(this.$overlay);
  };

  View.prototype.hideOverlay = function () {
    this.$overlay.html("");
    this.$transparent.addClass("invisible");
  };

  View.prototype.showOverlay = function () {
    this.$transparent.removeClass("invisible");
  };

  View.prototype.addOverlayContent = function (headerText, buttonText) {
    var $header = this.buildOverlayHeader(headerText);
    var $button = this.buildOverlayButton(buttonText);

    this.$overlay.append($header);
    this.$overlay.append($button);
  };

  View.prototype.buildOverlayHeader = function (text) {
    return $("<h3>").addClass("overlay-header").text(text);
  };

  View.prototype.buildOverlayButton = function (text) {
    var $button = $("<button>")
      .addClass("btn")
      .addClass("btn-primary")
      .addClass("overlay-btn")
      .text(text);

    $button.one("click", this.start.bind(this));

    return $button;
  };

  View.prototype.stopCallback = function (headerText, buttonText) {
    this.showOverlay();
    this.clock.stop();

    if (!this.game.paused) {
      this.clock.finalCountdown(this.$score);
    }

    setTimeout(function () {
      this.addOverlayContent(headerText, buttonText);
    }.bind(this), 1000);
  };

  View.prototype.updateScoreCallback = function () {
    this.$score.text(this.game.score);
  };

  var comboColors = [
    null,
    null,
    "#ff9300",
    "#ff6c00",
    "#ff4600",
    "#ff2000"
  ];

  View.prototype.updateComboCallback = function () {
    if (this.comboTimeout) {
      clearTimeout(this.comboTimeout);
    }

    this.$combo.text(this.game.combo);
    if (this.game.combo > 1) {
      this.$combo.css("color", comboColors[this.game.combo] || "red");
      this.$combo.removeClass("invisible");
      this.comboTimeout = setTimeout(function () {
        this.$combo.addClass("invisible");
      }.bind(this), 3000);
    }
  };

  View.prototype.start = function () {
    this.hideOverlay();
    this.clock && this.clock.stop();

    setTimeout(function () {
      if (this.game && this.game.paused) {
        this.clock.start();
        this.game.unpause();
      } else {
        this.game = new Columns.Game({
          canvas: this.canvas,
          keyPresses: this.keyPresses,
          stopCallback: this.stopCallback.bind(this),
          updateScoreCallback: this.updateScoreCallback.bind(this),
          updateComboCallback: this.updateComboCallback.bind(this)
        });

        this.clock = new Columns.Clock({
          game: this.game,
          $clock: this.$clock
        });

        this.clock.start();
        this.game.play();
      }
    }.bind(this), 0);
  };
});