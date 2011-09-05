jQuery.fn.center = ->
  $win = $(window)
  this.css
    top:  "#{($win.height() - this.outerHeight()) / 2 + $win.scrollTop() }px"
    left: "#{($win.width()  - this.outerWidth() ) / 2 + $win.scrollLeft()}px"

jQuery.fn.keepCentered = ->
  $(window).scroll( () => this.center() ).resize () => this.center()
  this

jQuery.fn.fitToWindow = (maxHeight) ->
  height = this.height() + $(document).height() - $("html").outerHeight()
  this.css "height", "#{Math.min height, maxHeight} px"

jQuery.fn.keepFitToWindow = (maxHeight) ->
  $(window).scroll( () => this.fitToWindow maxHeight ).resize () => this.fitToWindow maxHeight
  this

jQuery.fn.beforeload = (fn) ->
  this[0].addEventListener "beforeload", fn, true
  this
