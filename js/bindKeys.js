$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  Columns.bindKeys = function (keyPresses) {
    $(document).on("keypress", function (event) {
      var code = event.keyCode;

      switch (code) {
        case 'a':
          keyPresses.a += 1;
          break;
        case 's':
          keyPresses.s += 1;
          break;
        case 'd':
          keyPresses.d += 1;
          break;
        case 'w':
          keyPresses.w += 1;
          break;
      }
    });
  };
});