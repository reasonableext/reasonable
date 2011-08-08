# Copyright 2011 Bryan McKelvey

# Get domain name from URL
URL_REGEX = /^https?:\/\/(www\.)?([^\/]+)?/i

# Picture regex is based on RFC 2396. It doesn't require a prefix and allows ? and # suffixes.
PICTURE_REGEX = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png|bmp))(?:\?([^#]*))?(?:#(.*))?/i

# Pretty strict filter. May want to revise for linking to someone's profile page.
YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)(?:\#t\=[0-9]{2}m[0-9]{2}s)?/i

# Article URL regular expressions
ARTICLE_REGEX = /reason\.com\/(.*?)(?:\#comment)?s?(?:\_[0-9]{6,7})?$/
ARTICLE_SHORTEN_REGEX = /^(?:archives|blog)?\/(?:19|20)[0-9]{2}\/(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[0-1])\/(.*?)(?:\#|$)/

# Post labels
COLLAPSE = "show direct"
UNCOLLAPSE = "show all"
IGNORE = "ignore"
UNIGNORE = "unignore"

# Avatars
AVATAR_PREFIX = "http://www.gravatar.com/avatar/"
AVATAR_SUFFIX = "?s=40&d=identicon"
MY_MD5 = "b5ce5f2f748ceefff8b6a5531d865a27"

# Lights out
LIGHTS_OUT_OPACITY = 0.5
MINIMAL_OPACITY = 0.01
TOTAL_OPACITY = 1
FADE_SPEED = 500
MINIMAL_FADE_SPEED = 5

# Others and magic number avoidance
COMMENT_HISTORY = "Comment History"
ESCAPE_KEY = 27
FIRST_MATCH = 1
QUICKLOAD_SPEED = 100
UPDATE_POST_TIMEOUT_LENGTH = 60000

# Can't be set as constants, but should not be modified
defaultSettings =
  name: null
  history: []
  hideAuto: true
  shareTrolls: true
  showAltText: true
  showUnignore: true
  showPictures: true
  showYouTube: true
  keepHistory: true
  highlightMe: true
  showGravatar: false
  blockIframes: false
  updatePosts: false
  name: ""

months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

settings
trolls = []
lightsOn = false

getName = ($strong) ->
  # Get name from STRONG tag encapsulating poster's name
  if $strong.children("a").size > 0
    # Kind of ugly, but necessary to avoid CDATA
    temp = $("a", $strong).text()
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

getSettings = (response, defaults) ->
  reset = false

  # Use saved settings if they exist
  temp = response.settings ? {}
  
  $.each defaults, (key, value) ->
    switch temp[key]
      when undefined
        temp[key] = value
        reset = true
      when "true"  then temp[key] = true
      when "false" then temp[key] = false # prevents boolean true from being stored as text
      else
        # Some operations need to be done on the trolls and history settings
        switch key
          when "trolls"
            arr = JSON.parse temp.trolls
            temp.trolls = {}

            $.each arr, (trollKey, trollValue) ->
              if trollValue is actions.black.value or (temp.hideAuto and trollValue is actions.auto.value)
                temp.trolls[trollKey] = trollValue
          when "history"
            try
              temp.history = JSON.parse(temp.history).sort (a,b) -> a.permalink - b.permalink
            catch error
              temp = []

  # Store settings, then save anything that had to be reset
  settings = temp
  chrome.extension.sendRequest { type: "reset", settings: temp } if reset

showMedia = ->
  if settings.showPictures or settings.showYouTube
    $("div.com-block p a").each () ->
      $this = $ this
      
      # Picture routine
      if settings.showPictures
        if PICTURE_REGEX.test $this.attr "href"
          $img = $("<img>").addClass("ableCommentPic").attr "src", $this.attr "href"
          $this.parent().after $img

      # YouTube routine
      if settings.showYouTube
        matches = YOUTUBE_REGEX.exec $this.attr "href"
        if matches?
          $youtube = $("<iframe>").addClass("youtube-player").attr
            title: "YouTube video player"
            type: "text/html"
            width: "480"
            height: "390"
            src: "http://www.youtube.com/embed/" + matches[1]
            frameborder: "0"
          $this.parent().after $youtube

    $("div.com-block p:not(:has(a)):contains(http)").each () ->
      $this = $ this
      if settings.showPictures
        if PICTURE_REGEX.test $this.text()
          $img = $("<img>").addClass("ableCommentPic").attr "src", $this.text()
          $this.after $img

altText = ->
  if settings.showAltText
    # Applies to all images with an alt attribute within an article
    $("div.post img[alt]").each () ->
      # When clicked, show the image at its fullest visible dimensions
      # against a darkened background
      $img = $("<img>").attr("src", this.src).click () -> showImagePopup this

      $div = $("<div>").addClass("ablePic").append($img).append this.alt
      $(this).replaceWith $div

viewThread = ->
  showDirects = ->
    curScroll = $(window).scrollTop()
    hideHeight = 0
    iter = 0
    $comment = $(this).parent().parent()

    # Get last digit for depth, ignoring the added class for trolls
    depth = parseInt $comment.attr("class").replace(" troll", "").substr -1
    $comment.addClass("ableHighlight").find(".ableShow").text UNCOLLAPSE

    while depth > 0 and iter <= 100
      $comment = $comment.prev()
      if parseInt $comment.attr("class").replace(" troll", "").substr -1 is depth - 1
        $comment.addClass("ableHightlight").find(".ableShow").text UNCOLLAPSE
        depth--
      else
        hideHeight += $comment.height()

        # You can't get the height of a hidden element, so store height
        # in data attribute for when you want to unhide it later
        $comment.data("height", $comment.height()).slideUp()
      iter++
    $("html, body").animate { scrollTop: "#{curScroll - hideHeight} px" }

  showAll = () ->
    showHeight = 0
    $hidden = $(this).parent().parent().siblings ":hidden"
    $hidden.each () ->
      $this = $(this)
      $this.slideDown()
      showHeight += $this.data "height" # .height() will return 0
    $(".ableHighlight").removeClass("ableHighlight").find(".ableShow").text COLLAPSE
    $("html, body").animate { scrollTop: "#{$(window).scrollTop() + showHeight} px" }

  $("h2.commentheader:not(:has(a.ignore))").each () ->
    $strong = $ "strong:first", this
    name    = getName $strong
    link    = getLink $strong
    $pipe   = $("<span>").addClass("pipe").text("|")

    $show   = $("<a>").addClass("ableShow").click (event) ->
      if $(this).parent().parent().hasClass "ableHighlight"
        showAll.call this
      else
        showDirects.call this
    .text COLLAPSE
    
    $ignore = $("<a>").addClass("ignore").data("name", name).data("link", link).click (event) ->
      $this   = $ this
      $strong = $this.siblings "strong:first"
      name    = $this.data "name"
      link    = $this.data "link"

      if $this.text is IGNORE
        chrome.extension.sendRequest { type: "addTroll", name: name, link: link }, (response) ->
          if response.success
            settings.trolls[name] = actions.black.value
            if link
              settings.trolls[link] = actions.black.value
            blockTrolls true
          else
            alert "Adding troll failed! Try doing it manually in the options page for now. :("
      else
        chrome.extension.sendRequest { type: "removeTroll", name: name, link: link }, (response) ->
          if response.success
            delete settings.trolls[name]
            delete settings.trolls[link]
            blockTrolls true
          else
            alert "Removing troll failed! Try doing it manually in the options page for now. :("
    .text IGNORE
    $(this).append($pipe).append($show).append($pipe.clone()).append $ignore

updatePosts = ->
  if settings.updatePosts
    $.ajax
      url: window.location.href
      success: (data) ->
        re = /<div class=\"com-block[\s\S]*?<\/div>[\s\S]*?<\/div>/gim
        idRe = /id=\"(comment_[0-9].*?)\"/
        match = re.exec data
        comments = []
        $curNode
        $prevNode = null
        $container = $ "#commentcontainer"
        updateLinks = false

        while match?
          ids = idRe.exec match
          comments.push { html: match, id: ids[1] }
          match = re.exec data

        $.each comments, () ->
          html     = this.html.toString().replace(/\/\/[\s\S]*?\]\]>/, "temp")
          $curNode = $("#" + this.id)

          if $curNode.size() is 0
            updateLinks = true
            if $prevNode?
              $prevNode.after html
              $prevNode = $prevNode.next()
            else
              $container.append html
              $prevNode = $container.children "div:first"
          else $prevNode = $curNode

        viewThread()
        blockTrolls false

    setTimeout updatePosts, UPDATE_POST_TIMEOUT_LENGTH

blockTrolls = (smoothTransitions) ->
  showHeight = 0

  $($("h2.commentheader strong")).each () ->
    $this   = $(this);
    $ignore = $this.siblings "a.ignore"
    name    = $ignore.data "name"
    link    = $ignore.data "link"

    if name in settings.trolls or (link isnt "" and link in settings.trolls)
      # If poster is a troll, strip A tag, add troll class, and hide comment body
      $body = $this.html(name).siblings("a.ignore").text(UNIGNORE).closest("div").addClass("troll").children "p, blockquote, img, iframe"
      $this.siblings("a.ignore").hide().prev("span.pipe").hide() unless settings.showUnignore

      if smoothTransitions then $body.slideUp() else $body.hide()
    else if smoothTransitions and $ignore.text() is UNIGNORE
      # Unhide unignored trolls
      $this.siblings("a.ignore").text(IGNORE).closest("div").removeClass("troll").children("p, blockquote").slideDown()

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

gravatars = ->
  # Add gravatars in the top right corner of each post
  if settings.showGravatar
    $(".commentheader > strong").each () ->
      $this = $ this
      $link = $ "a", $this
      hash  = ""

      # Create hash based on poster link or name
      if $this.text() is "Amakudari"                        # Me
        hash = MY_MD5
      else if $link.size() is 0                             # No link
        hash = md5 $this.text()
      else if $link.attr("href").indexOf("mailto:") > -1    # Email address
        hash = md5 $link.attr("href").replace "mailto:", ""
      else                                                  # URL
        hash = md5 $link.attr "href"
      
      $img = $("<img>").addClass("ableGravatar").attr "src", AVATAR_PREFIX + hash + AVATAR_SUFFIX
      $this.closest("div").prepend $img

formatDate = (milliseconds) ->
  # Format date like November 23, 1984
  date = new Date milliseconds
  "#{months[date.getMonth()]} #{date.getDate()}, #{date.getFullYear()}"

buildQuickload = ->
  # May load beforehand if comments haven't been opened yet. In that case, make sure
  # this doesn't run again
  if $("#ableQuick").size() is 0
    if settings.history.length > 0
      # Set up quickload bar
      $ul   = $("<ul>")
      date  = ""
      count = 0

      $.each settings.history, (index, value) ->
        if count++ <= QUICKLOAD_MAX_ITEMS
          shortenMatch = ARTICLE_SHORTEN_REGEX.exec(value.url)[FIRST_MATCH]
          temp = formatDate value.timestamp

          unless temp is date
            date = temp
            $ul = $ul.prepend($("<li>").append $("<h2>").text date).append $ "<ul>"

          $ul = $("li:first ul", $ul)
            .prepend($("<li>")
              .append($("<a>").attr("href", "http://reason.com/#{value.url}#comment_#{value.permalink}")
                .text("#{shortenMatch} (#{value.permalink})"))).parent().parent()

      $quickload = $("<div>").attr("id", "ableQuick")
        .append($("<h3>").text COMMENT_HISTORY)
        .append($ul)
        .hover ( ()-> $ul.slideDown QUICKLOAD_SPEED ),
               ( ()-> $ul.slideUp   QUICKLOAD_SPEED )
      $("body").append $quickload.append $ul

historyAndHighlight = ->
  if settings.keepHistory or settings.highlightMe
    permalink = 0
 
    if settings.name? and settings.name isnt ""
        $("h2.commentheader > strong:contains('#{settings.name}') ~ a.permalink").each () ->
          if settings.keepHistory
            temp = parseFloat $(this).attr("href").replace "#comment_", ""
            permalink = temp if temp > permalink
          $(this).closest("div").addClass "ableMe" if settings.highlightMe

    if settings.keepHistory
      # Add to history
      if permalink is 0 then buildQuickload()
      else
        urlMatches = ARTICLE_REGEX.exec window.location.href
        chrome.extension.sendRequest { type: "keepHistory", url: urlMatches[1], permalink: permalink }, (response) ->
          unless response.exists
            # Add to history if background script returns that this post is new
            settings.history.unshift { timestamp: response.timestamp, url: urlMatches[1], permalink: permalink }
          buildQuickload()

quickInsert = (tag, attrs, $textarea) ->
  # Get beginning, middle and end of text selected
  textarea  = $textarea[0]
  text      = $textarea.val()
  startPos  = textarea.selectionStart
  endPos    = textarea.selectionEnd
  startText = text.substr 0, startPos
  midText   = text.substr startPos, endPos - startPos
  endText   = text.substr endPos

  startTag = "<#{tag}"
  endTag = "</#{tag}>"

  if attrs?
    $.each attrs, (name, attr) -> startTag += " #{attr}=\"#{prompt "Enter " + name + ":"}\""

  startTag += ">"
  $textarea.val(startText + startTag + midText + endTag + endText).focus()
  textarea.selectionStart = startPos + startTag.length
  textarea.selectionEnd   = endPos   + startTag.length
  false # prevent going to anchor

buildQuickInsert = ->
  buildToolbar = ($textarea) ->
    $textarea.before($("<div>").addClass("ableInsert")
      .append($("<a>").attr("href", "#").text("link").click(   () -> quickInsert "a", { URL: "href" }, $textarea ))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("quote").click(  () -> quickInsert "blockquote", null, $textarea ))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("bold").click(   () -> quickInsert "b", null, $textarea ))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("italic").click( () -> quickInsert "i", null, $textarea ))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("strike").click( () -> quickInsert "s", null, $textarea )))

  $("textarea").each () -> buildToolbar $ this
  $(".comment_reply.submit").click () ->
    buildToolbar $(this).parent().next(".leave-comment.reply").find "textarea"

# Main routine
# Only run these if there is a comment section displayed
commentOnlyRoutines = ->
  gravatars()
  viewThread()
  blockTrolls false
  historyAndHighlight()
  setTimeout ( () -> updatePosts() ), UPDATE_POST_TIMEOUT_LENGTH

# Content scripts can't access local storage directly,
# so we have to wait for info from the background script before proceeding
chrome.extension.sendRequest { type: "settings" }, (response) ->
  defaultSettings.trolls = response.trolls
  getSettings response, defaultSettings
  lightsOut()
  altText()
  showMedia()
  buildQuickInsert()

  # Run automatically if comments are open, otherwise bind to the click
  # event for the comment opener link
  if window.location.href.indexOf("#comment") is -1
    buildQuickload()
    $("div#commentcontrol").one "click", commentOnlyRoutines # fire only once
  else
    commentOnlyRoutines()
