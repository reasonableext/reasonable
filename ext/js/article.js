(function() {
  var altText, lightsOut, removeGooglePlus, showImagePopup;
  showImagePopup = function(img) {
    var $box, $img, $win;
    $win = $(window);
    $box = $("div#ableLightsOutBox");
    return $img = $("<img>").load(function() {
      var $this, lightsOn;
      $this = $(this);
      $("div#ableLightsOut").css("height", $(document).height()).fadeTo(FADE_SPEED, LIGHTS_OUT_OPACITY);
      $box.empty().append($img).fadeTo(MINIMAL_FADE_SPEED, MINIMAL_OPACITY, function() {
        return $(this).center().fadeTo(FADE_SPEED - MINIMAL_FADE_SPEED, TOTAL_OPACITY);
      }).fadeTo(FADE_SPEED, TOTAL_OPACITY);
      return lightsOn = true;
    }).attr("src", $(img).attr("src"));
  };
  altText = function() {
    if (settings.showAltText) {
      return $("div.post img[alt]").each(function() {
        var $div, $img;
        $img = $("<img>").attr("src", this.src).click(function() {
          return showImagePopup(this);
        });
        $div = $("<div>").addClass("ablePic").append($img).append(this.alt);
        return $(this).replaceWith($div);
      });
    }
  };
  lightsOut = function() {
    var $box, $overlay, turnLightsOn;
    $overlay = $("<div>").attr("id", "ableLightsOut").css("height", $(document).height());
    $box = $("<div>").attr("id", "ableLightsOutBox").keepCentered();
    turnLightsOn = function() {
      var lightsOn;
      lightsOn = false;
      $overlay.fadeOut();
      return $box.fadeOut();
    };
    $("body").append($box.click(turnLightsOn)).append($overlay.click(turnLightsOn));
    return $(window).keydown(function(event) {
      if (lightsOn && event.which === ESCAPE_KEY) {
        return turnLightsOn();
      }
    });
  };
  removeGooglePlus = function() {
    if (settings.blockIframes) {
      return $("li.google").remove();
    }
  };
}).call(this);
