$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var View = Columns.View = function (canvasId, width, height) {
    if (width % 20 || height % 20) {
      throw "canvas width and height must be multiples of 20";
    }

    this.canvas = new fabric.Canvas(canvasId);

    this.canvas.setWidth(width);
    this.canvas.setHeight(height);

    this.keyPresses = { p: 0, a: 0, w: 0, s: 0, d: 0 };

    Columns.bindKeys(this.keyPresses);

    this.buildOverlay();
    this.addOverlayContent("Welcome", "Play Game");
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
    this.showOverlay();

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

    $button.one("click", function () {
      this.start();
    }.bind(this));

    return $button;
  };

  View.prototype.stopCallback = function (headerText, buttonText) {
    this.showOverlay();

    setTimeout(function () {
      this.addOverlayContent(headerText, buttonText);
    }.bind(this), 1000);
  };

  View.prototype.updateScoreCallback = function () {
    $("#score").text(this.game.score);
  };

  View.prototype.start = function () {
    this.hideOverlay();

    if (this.game && this.game.paused) {
      this.game.unpause();
    } else {
      this.game = new Columns.Game({
        canvas: this.canvas,
        keyPresses: this.keyPresses,
        stopCallback: this.stopCallback.bind(this),
        updateScoreCallback: this.updateScoreCallback.bind(this)
      });

      this.game.play();
    }
  };
});