(function() {

  jQuery.fn.center = function() {
    var $win;
    $win = $(window);
    return this.css({
      top: "" + (($win.height() - this.outerHeight()) / 2 + $win.scrollTop()) + "px",
      left: "" + (($win.width() - this.outerWidth()) / 2 + $win.scrollLeft()) + "px"
    });
  };

  jQuery.fn.keepCentered = function() {
    var _this = this;
    $(window).scroll(function() {
      return _this.center();
    }).resize(function() {
      return _this.center();
    });
    return this;
  };

  jQuery.fn.fitToWindow = function(maxHeight) {
    var height;
    height = this.height() + $(document).height() - $("html").outerHeight();
    return this.css("height", "" + (Math.min(height, maxHeight)) + " px");
  };

  jQuery.fn.keepFitToWindow = function(maxHeight) {
    var _this = this;
    $(window).scroll(function() {
      return _this.fitToWindow(maxHeight);
    }).resize(function() {
      return _this.fitToWindow(maxHeight);
    });
    return this;
  };

  jQuery.fn.beforeload = function(fn) {
    this[0].addEventListener("beforeload", fn, true);
    return this;
  };

}).call(this);
