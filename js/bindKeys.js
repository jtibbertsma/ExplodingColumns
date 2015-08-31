$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  Columns.bindKeys = function (keyPresses) {
    $(document).on("keypress", function (event) {
      var code = event.keyCode;

      switch (code) {
        case 97:
          keyPresses.a += 1;
          break;
        case 115:
          keyPresses.s += 1;
          break;
        case 100:
          keyPresses.d += 1;
          break;
        case 119:
          keyPresses.w += 1;
          break;
      }
    });
  };
});