// Centers in the window
jQuery.fn.center = function() {
  var $window = $(window);
  this.css({
    top: ($window.height() - this.outerHeight()) / 2 + $window.scrollTop() + "px",
    left: ($window.width() - this.outerWidth()) / 2 + $window.scrollLeft() + "px"
  })  
  return this;
};

// Keeps centered even if the user scrolls or resizes the window
jQuery.fn.keepCentered = function() {
  var $this = this;
  $(window).scroll(function() { $this.center(); }).resize(function() { $this.center(); });
  return this;
};

jQuery.fn.topRight = function() {
  this.css({
    top: $(window).scrollTop() + "px",
    right: $(window).scrollLeft() + "px"
  });
  return this;
};

jQuery.fn.keepInTopRight = function() {
  var $this = this;
  $(window).scroll(function() { $this.topRight(); }).resize(function() { $this.topRight(); });
  return this;
};

jQuery.fn.fitToWindow = function(maxHeight) {
  var height = this.height() + $(document).height() - $("html").outerHeight()
  this.css("height", (height > maxHeight ? maxHeight : height) + "px");
  return this;
};

jQuery.fn.keepFitToWindow = function(maxHeight) {
  var $this = this;
  $(window).scroll(function() { $(this).fitToWindow(maxHeight); }).resize(function() { $(this).fitToWindow(maxHeight); });
  return this;
};

jQuery.fn.beforeload = function(fn) {
  this[0].addEventListener("beforeload", fn, true);
  return this;
}