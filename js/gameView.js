$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  var GameView = Columns.GameView = function (canvasId, width, height) {
    if (width % 20 || height % 20) {
      throw "canvas width and height must be multiples of 20";
    }

    this.canvas = new fabric.Canvas(canvasId);

    this.canvas.setWidth(width);
    this.canvas.setHeight(height);

    this.width = width;
    this.height = height;

    this.numberToExplode = 4;
    this.avalanchRows = 1;

    this.numColumns = width / 20;
    // this.numRows = height / 20;
    this.startCol = Math.floor(this.numColumns / 2);
    this.colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow'];

    this.dropQueue = new Columns.DropQueue(this);
    this.keyPresses = {};
    this.clearKeyPresses();

    Columns.bindKeys(this.keyPresses);
  };

  GameView.prototype.createPlayGamePane = function () {
    var $canvasContainer = $(".canvas-container");

    this.$transparent = $("<div>").addClass("overlay");
    this.$overlay = $("<div>").addClass("outer-overlay");

    $canvasContainer.append(this.$transparent);
    $canvasContainer.append(this.$overlay);

    this.$overlay.append($("<h3 class=\"game-over\">Welcome</h3>"));
    this.makeOverlayButton("Play Game");
  };

  GameView.prototype.makeOverlayButton = function (text) {
    var $start = $("<button>")
      .addClass("btn")
      .addClass("btn-primary")
      .addClass("overlay-btn")
      .text(text);

    this.$overlay.append($start);

    $start.one("click", function () {
      this.start();
    }.bind(this));
  };

  GameView.prototype.clearKeyPresses = function () {
    this.keyPresses.a = 0;
    this.keyPresses.s = 0;
    this.keyPresses.w = 0;
    this.keyPresses.d = 0;
  };

  GameView.prototype.randomColor = function () {
    return this.colors[Math.floor(Math.random()*this.colors.length)];
  };

  GameView.prototype.start = function () {
    this.clearKeyPresses();

    this.canvas.on("nextIteration", this.nextIteration.bind(this));
    this.canvas.clear();
    this.$overlay.html("");
    this.$transparent.addClass("invisible");

    this.columns = [];

    for (i = 0; i < this.numColumns; i++) {
      this.columns.push([]);
    }

    this.fallSpeed = 2;
    this.turnNumber = 0;
    this.combo = 0;

    this.nextPair();
  };

  GameView.prototype.gameOver = function () {
    return this.columns[this.startCol].length * 20 > this.height;
  };

  GameView.prototype.addToDropQueue = function (block) {
    this.dropQueue.add(block);
  };

  GameView.prototype.executeDrop = function () {
    this.dropQueue.executeDrop();
  };

  GameView.prototype.raiseDifficulty = function () {
    //this.avalanchRows++;
    this.fallSpeed++;
  };

  GameView.prototype.avalanch = function () {
    for (var i = 0; i < this.avalanchRows; i++) {
      for (var j = 0; j < this.numColumns; j++) {
        if (Math.random() > 0.5) {
          this.addToDropQueue(new Columns.Block({
            color: 'gray',
            top: -20 - (i * 20),
            col: j,
            view: this
          }));
        }
      }
    }

    setTimeout(this.executeDrop.bind(this), 0);
  };

  GameView.prototype.nextIteration = function () {
    this.clearKeyPresses();
    
    var blocksToExplode = Columns.searchForExplosions(this);

    if (blocksToExplode.length > 0) {
      this.combo += 1;
      Columns.explodeBlocks(this, blocksToExplode); // async
      return;
    }

    if (this.combo > 1) {
      this.fallSpeed -= 1;
      if (this.fallSpeed < 2) {
        this.fallSpeed = 2;
      }
    }
    this.combo = 0;

    if (!this.gameOver()) {
      if (++this.turnNumber % 30 === 0) {
        this.raiseDifficulty();
      }

      if (this.turnNumber % 10 === 0) {
        this.avalanch(); // async
        return;
      }

      this.nextPair();
    } else {
      this.canvas.off("nextIteration");
      this.$transparent.removeClass("invisible");

      setTimeout(function () {
        this.$overlay.append($("<h3 class=\"game-over\">Game Over</h3>"));

        this.makeOverlayButton("Play Again?");
      }.bind(this), 1000);
    }
  };

  GameView.prototype.nextPair = function () {
    var currentPair = new Columns.Pair({
      view: this,
      color1: this.randomColor(),
      color2: this.randomColor(),
      startCol: this.startCol,
      fallSpeed: this.fallSpeed
    });
    currentPair.fall();
  };
});