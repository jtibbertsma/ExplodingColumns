$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var DropQueue = Columns.DropQueue = function (view) {
    this.canvas = view.canvas;
    this.view = view;
    this._dropQueue = {};
  };

  DropQueue.prototype.add = function (block) {
    if (typeof this._dropQueue[block.col] === "undefined") {
      this._dropQueue[block.col] = [];
    }

    this._dropQueue[block.col].push(block);
  };

  DropQueue.prototype.executeDrop = function () {
    var keys = this.getDropOrder(Object.keys(this._dropQueue));
    this.canvas.on("doneDropping", this.doneDropping.bind(this));
    this._pending = 0;

    for (var time = 0, i = 0; i < keys.length; time += 50, i++) {
      setTimeout(this.dropColumn.bind(this, this._dropQueue[keys[i]]), time);
      this._pending += this._dropQueue[keys[i]].length;
    }
  };

  DropQueue.prototype.dropColumn = function (blocks) {
    for (var time = 0, i = 0, offset = 0;
            i < blocks.length; time += 30, offset -= 20, i++) {
      setTimeout(blocks[i].drop.bind(blocks[i], {
        topOffset: offset + 0,
        onComplete: function () {
          this.canvas.fire("doneDropping");
        }.bind(this)
      }), time);
    }
  };

  // The goal here is to drop columns starting with the middle, and then
  // working our way out.
  DropQueue.prototype.getDropOrder = function (keys) {
    var dropOrder = [];

    while (keys.length > 0) {
      var nextKey = Math.floor(keys.length / 2);
      dropOrder.push(keys[nextKey]);
      keys.splice(nextKey, 1);
    }

    return dropOrder;
  };

  DropQueue.prototype.doneDropping = function () {
    if (--this._pending === 0) {
      this.canvas.off("doneDropping");
      this._dropQueue = {};
      this.canvas.fire("nextIteration");
    }
  };
});