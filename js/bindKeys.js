$(function () {
  if (typeof Columns === "undefined") {
    window.Columns = {};
  }

  Columns.bindKeys = function (keyPresses) {
    $(document).on("keydown", function (event) {
      var code = event.keyCode;

      switch (code) {
        case 65:
        case 37:
          event.preventDefault();
          keyPresses.a += 1;
          break;
        case 83:
        case 40:
          event.preventDefault();
          keyPresses.s += 1;
          break;
        case 68:
        case 39:
          event.preventDefault();
          keyPresses.d += 1;
          break;
        case 87:
        case 38:
          event.preventDefault();
          keyPresses.w += 1;
          break;
        case 80:
          event.preventDefault();
          keyPresses.p += 1;
          break;
      }
    });
  };
});