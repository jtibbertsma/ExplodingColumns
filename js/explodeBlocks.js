$(function () {
  if (typeof Columns === "undefined") {
    Columns = {};
  }

  Columns.explodeBlocks = function (view, blocks) {
    console.log(blocks);
    view.canvas.fire("nextIteration");
  };
});