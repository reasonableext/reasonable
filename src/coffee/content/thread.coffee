comments = []

getDate = (node) ->
  match = COMMENT_DATE_REGEX.exec node.nodeValue
  if match
    createFromET "20#{match[3]}", parseInt(match[1]), match[2],
      parseInt(match[4]) % 12 + (if match[6] is "PM" then 12 else 0), match[5]
  else null

getPermalink = ($node) ->
  $node.attr "href"

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
      if parseInt($comment.attr("class").replace(" troll", "").substr -1) is depth - 1
        $comment.addClass("ableHighlight").find(".ableShow").text UNCOLLAPSE
        depth--
      else
        hideHeight += $comment.height()

        # You can't get the height of a hidden element, so store height
        # in data attribute for when you want to unhide it later
        $comment.data("height", $comment.height()).slideUp()
      iter++
    $("html, body").animate { scrollTop: "#{curScroll - hideHeight}px" }

  showAll = () ->
    showHeight = 0
    $hidden = $(this).parent().parent().siblings ":hidden"
    $hidden.each () ->
      $this = $(this)
      $this.slideDown()
      showHeight += $this.data "height" # .height() will return 0
    $(".ableHighlight").removeClass("ableHighlight").find(".ableShow").text COLLAPSE
    $("html, body").animate { scrollTop: "#{$(window).scrollTop() + showHeight}px" }

  $("h2.commentheader:not(:has(a.ignore))").each () ->
    $header   = $(this)
    $strong   = $header.children("strong:first")
    name      = getName      $strong
    link      = getLink      $strong
    date      = getDate      $header.contents()[DATE_INDEX]
    permalink = getPermalink $header.children("a.permalink")
    comments.push { name: name, link: link, date: date, permalink: permalink }
    $pipe     = $("<span>").addClass("pipe").text("|")

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

      if $this.text() is IGNORE
        chrome.extension.sendRequest { type: "addTroll", name: name, link: link }, (response) ->
          if response.success
            settings.trolls[name] = actions.black.value
            settings.trolls[link] = actions.black.value if link
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
  comments.sort (a, b) -> a.date < b.date

showActivity = ->
  if settings.showActivity
    commentCount   = 0
    activity       = [0, 0, 0, 0, 0]
    latestComments = ""
    descByDate = (a, b) ->
      if      a.date > b.date then -1
      else if a.date < b.date then  1
      else                          0

    # Sort and get the last date
    currentDate = new Date()
    comments.sort descByDate

    for comment in comments
      # Collect latest comments as links in a list
      if commentCount < LATEST_COMMENT_COUNT
        commentCount++
        latestComments += "<li><a href='#{comment.permalink}'>#{comment.name}</a></li>"

      withinCutoff = false
      for cutoff, index in ACTIVITY_CUTOFFS
        if currentDate - comment.date <= cutoff
          activity[i]++ for i in [index..ACTIVITY_CUTOFFS.length]
          withinCutoff = true
          break
      break unless withinCutoff or commentCount < LATEST_COMMENT_COUNT

    html = """
           <div id='ableActivity' class='ableBox'>
             <h3>Thread Activity</h3>
             <ul>
               <li>
                 <h4>Most recent #{commentCount} post#{if commentCount is 1 then "" else "s"}</h4>
                 <ul>
                   #{latestComments}
                 </ul>
               </li>
               <li>
                 <h4>Post frequency</h4>
                 <table>
                   <tr><th>Last 5 min</th><td>#{  activity[0]}</td></tr>
                   <tr><th>Last 15 min</th><td>#{ activity[1]}</td></tr>
                   <tr><th>Last 30 min</th><td>#{ activity[2]}</td></tr>
                   <tr><th>Last 1 hour</th><td>#{ activity[3]}</td></tr>
                   <tr><th>Last 2 hours</th><td>#{activity[4]}</td></tr>
                 </ul>
               </li>
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
