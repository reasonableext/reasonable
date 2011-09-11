var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
jQuery.fn.center = function() {
  var $win;
  $win = $(window);
  return this.css({
    top: "" + (($win.height() - this.outerHeight()) / 2 + $win.scrollTop()) + "px",
    left: "" + (($win.width() - this.outerWidth()) / 2 + $win.scrollLeft()) + "px"
  });
};
jQuery.fn.keepCentered = function() {
  $(window).scroll(__bind(function() {
    return this.center();
  }, this)).resize(__bind(function() {
    return this.center();
  }, this));
  return this;
};
jQuery.fn.fitToWindow = function(maxHeight) {
  var height;
  height = this.height() + $(document).height() - $("html").outerHeight();
  return this.css("height", "" + (Math.min(height, maxHeight)) + " px");
};
jQuery.fn.keepFitToWindow = function(maxHeight) {
  $(window).scroll(__bind(function() {
    return this.fitToWindow(maxHeight);
  }, this)).resize(__bind(function() {
    return this.fitToWindow(maxHeight);
  }, this));
  return this;
};
jQuery.fn.beforeload = function(fn) {
  this[0].addEventListener("beforeload", fn, true);
  return this;
};