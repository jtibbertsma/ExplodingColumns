$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  var DropQueue = Columns.DropQueue = function (options) {
    this.onComplete = options.onComplete;
    this._dropQueue = {};
  };

  DropQueue.prototype.add = function (tile) {
    if (typeof this._dropQueue[tile.col] === "undefined") {
      this._dropQueue[tile.col] = [];
    }

    this._dropQueue[tile.col].push(tile);
  };

  DropQueue.prototype.executeDrop = function () {
    var keys = this.getDropOrder(Object.keys(this._dropQueue));
    this._pending = 0;

    for (var time = 0, i = 0; i < keys.length; time += 50, i++) {
      setTimeout(this.dropColumn.bind(this, this._dropQueue[keys[i]]), time);
      this._pending += this._dropQueue[keys[i]].length;
    }

    // In case executeDrop is called on an empty dropQueue
    if (this._pending === 0) {
      this.onComplete();
    }
  };

  DropQueue.prototype.dropColumn = function (tiles) {
    for (var time = 0, i = 0, offset = 0;
            i < tiles.length; time += 30, offset -= 20, i++) {
      setTimeout(tiles[i].drop.bind(tiles[i], {
        topOffset: offset,
        onComplete: this.doneDropping.bind(this)
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
      this._dropQueue = {};
      this.onComplete();
    }
  };
});