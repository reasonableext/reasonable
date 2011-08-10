getName = ($strong) ->
  # Get name from STRONG tag encapsulating poster's name
  if $strong.children("a").size() > 0
    # Kind of ugly, but necessary to avoid CDATA
    temp = $strong.children("a").text()
  else
    temp = $strong.text()

  # Strip leading and trailing whitespace
  temp = temp.replace /^\s|\s$/g, ""

getLink = ($strong) ->
  if $strong.children("a").size() > 0
    temp = $("a", $strong).attr "href"

    # For blogwhore filtering, get domain name if link is a URL
    match = temp.match URL_REGEX
    if match
      temp = JSON.stringify match[2]
    else
      temp = temp.replace "mailto:", ""

    # Replace quotation marks with blank spaces
    temp = temp.replace /"/g, ""
  else "" # ignore if no link

blockTrolls = (smoothTransitions) ->
  showHeight = 0

  $("h2.commentheader strong").each () ->
    $this   = $ this
    $ignore = $this.siblings "a.ignore"
    name    = $ignore.data "name"
    link    = $ignore.data "link"

    if settings.trolls[name]? or (link isnt "" and settings.trolls[link]?)
      # If poster is a troll, strip A tag, add troll class, and hide comment body
      $body = $this.html(name).siblings("a.ignore").text(UNIGNORE).closest("div").addClass("troll").children "p, blockquote, img, iframe"
      $this.siblings("a.ignore").hide().prev("span.pipe").hide() unless settings.showUnignore

      if smoothTransitions then $body.slideUp() else $body.hide()
    else if smoothTransitions and $ignore.text() is UNIGNORE
      # Unhide unignored trolls
      $this.siblings("a.ignore").text(IGNORE).closest("div").removeClass("troll").children("p, blockquote").slideDown()
    true
