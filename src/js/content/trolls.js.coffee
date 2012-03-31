blockTrolls = (smoothTransitions) ->
  showHeight = 0

  $("h2.commentheader strong").each () ->
    $this     = $(this)
    $ignore   = $this.siblings("a.ignore")
    name      = $ignore.data "name"
    link      = $ignore.data "link"
    isTroll   = false
    isntTroll = false

    if settings.trolls[name]?
      if (settings.trolls[name] is actions.black.value) or (settings.trolls[name] is actions.auto.value and settings.hideAuto)
        isTroll = true
      else
        isntTroll = true

    if link isnt "" and settings.trolls[link]?
      if (settings.trolls[link] is actions.black.value) or (settings.trolls[link] is actions.auto.value and settings.hideAuto)
        isTroll = true
      else
        isntTroll = true

    # Filter out all content matching the list of filters
    unless isntTroll
      content = getContent($this)
      for paragraph in content
        if settings.filters.test(content)
          isTroll = true
          break

    # console.log "Troll status: " + isTroll

    if isTroll
      # If poster is a troll, strip A tag, add troll class, and hide comment body
      $body = $this.html(name).siblings("a.ignore").text(UNIGNORE).closest("div").addClass("troll").children "p, blockquote, img, iframe"
      $this.siblings("a.ignore").hide().prev("span.pipe").hide() unless settings.showUnignore

      if smoothTransitions then $body.slideUp() else $body.hide()
    else if smoothTransitions and $ignore.text() is UNIGNORE
      # Unhide unignored trolls
      $this.siblings("a.ignore").text(IGNORE).closest("div").removeClass("troll").children("p, blockquote").slideDown()
    true
