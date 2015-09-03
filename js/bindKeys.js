$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  Columns.bindKeys = function (keyPresses) {
    $(document).on("keydown", function (event) {
      event.preventDefault();
      var code = event.keyCode;

      switch (code) {
        case 37:
          keyPresses.a += 1;
          break;
        case 40:
          keyPresses.s += 1;
          break;
        case 39:
          keyPresses.d += 1;
          break;
        case 38:
          keyPresses.w += 1;
          break;
      }
    });

    $(document).on("keypress", function (event) {
      event.preventDefault();
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
        case 112:
          keyPresses.p += 1;
          break;
      }
    });
  };
});