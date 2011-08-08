showImagePopup = (img) ->
  $win = $ window
  $box = $ "div#ableLightsOutBox"
  $img = $("<img>").load () ->
    $this = $ this

    # Have to use setTimeout because height and width from the load event are both 0
    # Once we've waited a second after loading, though, it should work and be
    # able to center the image
    $("div#ableLightsOut").css("height", $(document).height()).fadeTo FADE_SPEED, LIGHTS_OUT_OPACITY
    $box.empty().append($img).fadeTo MINIMAL_FADE_SPEED, MINIMAL_OPACITY, () ->
      $(this).center().fadeTo FADE_SPEED - MINIMAL_FADE_SPEED, TOTAL_OPACITY
    .fadeTo FADE_SPEED, TOTAL_OPACITY
    lightsOn = true
  .attr "src", $(img).attr "src"

altText = ->
  if settings.showAltText
    # Applies to all images with an alt attribute within an article
    $("div.post img[alt]").each () ->
      # When clicked, show the image at its fullest visible dimensions
      # against a darkened background
      $img = $("<img>").attr("src", this.src).click () -> showImagePopup this

      $div = $("<div>").addClass("ablePic").append($img).append this.alt
      $(this).replaceWith $div

lightsOut = ->
  # When clicking on an image in the article, darken page and center image
  $overlay = $("<div>").attr("id", "ableLightsOut").css "height", $(document).height()
  $box = $("<div>").attr("id", "ableLightsOutBox").keepCentered()
  
  # Routine for turning lights on
  turnLightsOn = ->
    lightsOn = false
    $overlay.fadeOut()
    $box.fadeOut()
  
  $("body").append($box.click turnLightsOn).append $overlay.click turnLightsOn
  
  # Turns lights back on if escape key is pressed
  $(window).keydown (event) -> turnLightsOn() if lightsOn and event.which is ESCAPE_KEY

removeGooglePlus = ->
  if settings.blockIframes
    $("li.google").remove()
