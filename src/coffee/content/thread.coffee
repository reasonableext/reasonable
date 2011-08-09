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

showActivity = ->
  if settings.showActivity
    commentHTML = $("#commentcontainer").html()
    i = 0
    dates = []
    activity = [0, 0, 0, 0, 0]

    # Parse all date string in comments section
    while match = COMMENT_DATE_REGEX.exec commentHTML
      dates.push new Date "20#{match[3]}", parseInt(match[1]) - 1, match[2],
        parseInt(match[4]) % 12 + (if match[6] is "PM" then 12 else 0), match[5]

    # Sort and get the last date
    dates.sort()
    lastDate = dates[dates.length - 1]
    lastDateHours = lastDate.getHours()
    lastDateAmPm = "a"
    if lastDateHours >= 12
      lastDateHours -= 12
      lastDateAmPm = "p"
    lastDateHours += 12 if lastDateHours is 0
    lastDateMinutes = lastDate.getMinutes()
    lastDateMinutes = "0#{lastDateMinutes}" if lastDateMinutes < 10
    lastDateText = "#{lastDate.getMonth() + 1}/#{lastDate.getDate()}/#{lastDate.getFullYear()}
                    #{lastDateHours}:#{lastDateMinutes}#{lastDateAmPm}"

    for date in dates
      for cutoff, index in ACTIVITY_CUTOFFS
        if lastDate - date <= cutoff
          activity[index]++
          break

    html = """
           <div id='ableActivity'>
             <ul id='ableActivity'>
               <li>Latest post: #{  lastDateText}</li>
               <li>30 min prior: #{  activity[0]}</li>
               <li>1 hour prior: #{  activity[1]}</li>
               <li>4 hours prior: #{ activity[2]}</li>
               <li>12 hours prior: #{activity[3]}</li>
               <li>1 day prior: #{   activity[4]}</li>
             </ul>
           </div>
           """
    $("body").append html

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

historyAndHighlight = ->
  if settings.keepHistory or settings.highlightMe
    permalink = 0
 
    if settings.name? and settings.name isnt ""
      for header in $ "h2.commentheader > strong:contains('#{settings.name}') ~ a.permalink"
        $header = $(header)
        if settings.keepHistory
          temp = parseFloat $header.attr("href").replace "#comment_", ""
          permalink = temp if temp > permalink
        $header.closest("div").addClass "ableMe" if settings.highlightMe

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
