$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  Columns.bindKeys = function (keyPresses) {
    $(document).on("keydown", function (event) {
      event.preventDefault();
      var code = event.keyCode;

      switch (code) {
        case 65:
        case 37:
          keyPresses.a += 1;
          break;
        case 83:
        case 40:
          keyPresses.s += 1;
          break;
        case 68:
        case 39:
          keyPresses.d += 1;
          break;
        case 87:
        case 38:
          keyPresses.w += 1;
          break;
        case 80:
          keyPresses.p += 1;
          break;
      }
    });
  };
});