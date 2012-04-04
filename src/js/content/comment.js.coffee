class Comment
  constructor: (@node, @index, @post, @previous) ->
    @id        = @node.id.replace("comment_", "").parseInt()
    @header    = @node.getElementsByTagName("h2")[0]
    @content   = (p.textContent for p in @node.getElementsByTagName("p")).join("\n")
    @depth     = @node.className.substr(-1).parseInt()
    @name      = @extractName()
    @link      = @extractLink()
    @timestamp = @extractTimestamp()
    @previous.setNext this if @previous?

    if @name is Settings.username
      @isMe = yes
      @node.className += " ableMe"
    else
      @isMe = no

  setNext: (@next) ->

  showDirect: =>
    positionOf = (node) ->
      top = 0
      while node.offsetParent
        top  += node.offsetTop
        node  = node.offsetParent
      top

    offset  = window.scrollY - positionOf(@node)
    comment = this
    depth   = comment.depth + 1
    if comment.node.className.indexOf("highlight") is -1
      while depth isnt 0
        node = comment.node
        if comment.depth < depth
          node.className += " highlight"
          node.getElementsByClassName("collapser")[0].textContent = "+"
          depth = comment.depth
        else
          node.className += " collapsed"
        comment = comment.previous
    else
      # getElementsByClassName returns an immutable array that will change if you remove classes
      highlighted = (node for node in document.getElementsByClassName("highlight"))
      for node in highlighted
        node.className = node.className.replace(" highlight", "")
        node.getElementsByClassName("collapser")[0].textContent = "-"

      collapsed = (node for node in document.getElementsByClassName("collapsed"))
      for node in collapsed
        node.className = node.className.replace(" collapsed", "")

    # Return focus to original node
    window.scrollTo 0, [ positionOf(@node) + offset ]

  extractName: ->
    strong = @header.firstChild
    if strong.hasChildNodes()
      strong.lastChild.textContent
    else
      strong.textContent

  extractLink: ->
    strong = @header.firstChild
    if strong.hasChildNodes()
      strong.lastChild.href
    else
      null
    
  extractTimestamp: ->
    matches = @header.textContent.match(/(\d+)\.(\d+)\.(\d+) \@ (\d+):(\d+)(AM|PM)/)
    [_, month, day, year, hours, minutes, ampm] = matches
    year   = parseInt(year)  + 2000
    month  = parseInt(month) - 1
    hours  = parseInt(hours)
    hours -= 12 if hours is 12
    hours += 12 if ampm is "PM"

    # Adjust hours for daylight saving time
    if month is 2
      marchOffset  = new Date(year, 2, 1).getDay()
      marchOffset += 7 if marchOffset is 0
      secondSundayOfMarch = 15 - marchOffset
      if day is secondSundayOfMarch and hours >= 2
        hours--
      else if day > secondSundayOfMarch
        hours--
    else if month > 2 and month < 10
      hours--
    else if month is 10
      novemberOffset  = new Date(year, 10, 1).getDay()
      novemberOffset += 7 if novemberOffset is 0
      firstSundayOfNovember = 8 - novemberOffset
      if day is firstSundayOfNovember and hours < 2
        hours--
      else if day < firstSundayOfNovember
        hours--

    hours += 5
    +new Date(Date.UTC(year, month, day, hours, minutes, 0))

  # Filters are organized together to make it easier
  filterName:    => Filter.dialog "string", "name", @name
  filterLink:    => Filter.dialog "string", "link", @link
  filterCustom:  -> Filter.dialog "regex",  "content"
  
  addControls: ->
    nodes = DOMBuilder.create([
      { tag: "span", class: "pipe", text: "|" }
      {
        tag: "a"
        class: "collapser"
        text: "-"
        events:
          click: @showDirect
      }
      { tag: "span", class: "pipe", text: "|" }
      "filter"
      {
        tag: "a"
        class: "filter"
        text: "name"
        events:
          click: @filterName
      }, {
        tag: "a"
        class: "filter"
        text: "link"
        events:
          click: @filterLink
      }, {
        tag: "a"
        class: "filter"
        text: "custom"
        events:
          click: @filterCustom
      }
    ])

    @header.appendChild node for node, index in nodes

  isTroll: ->
    @filters = []
    for filter in @post.filters
      if filter.isTroll(this)
        @filters.push filter
    return (@filters.length isnt 0)

  toggle: (status) ->
    if status then @show() else @hide()

  runExtensions: ->
    if Comment.extensions?
      for extension in Comment.extensions
        extension.run this

  show: ->
    return if @visible
    for child in @node.children
      name = child.className
      if name is "filter_explanation"
        child.style.setProperty "display", "none"
      else if name is "comment_reply_msg"
        # ignore
      else
        child.style.removeProperty "display"
    @visible = yes

  hide: ->
    BLANK = /^\s*$/

    # Show only the explanation of why content is filtered
    for child in @node.children
      if child.className is "filter_explanation"
        child.style.removeProperty "display"
      else
        child.style.setProperty "display", "none"

    @explanation.parentNode.removeChild @explanation if @explanation?
    options = for filter in @filters
      {
        tag: "li"
        children:
          tag: "a"
          text: if BLANK.test(filter.text) then "(blank)" else filter.text
          events:
            click: => filter.remove()
      }

    options.push
      tag: "li"
      children:
        tag: "a"
        text: "show once"
        events:
          click: => @show()

    @explanation = DOMBuilder.create(
      tag: "div"
      class: "filter_explanation"
      children: [{
        tag: "p"
        text: "Remove filter:"
      }, {
        tag: "ul"
        children: options
      }]
    )

    @node.appendChild(@explanation)
    @visible = no

  showDepth: ->
    @node.className = @node.className.replace("depth0", "depth#{@depth}")

  hideDepth: ->
    @node.className = @node.className.replace("depth#{@depth}", "depth0")

  @addExtension: (extension) ->
    @extensions ?= []
    @extensions.push extension
