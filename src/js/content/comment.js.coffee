class Comment
  constructor: (@node, @index, @post) ->
    @id        = @node.id.replace("comment_", "").parseInt()
    @header    = @node.getElementsByTagName("h2")[0]
    @content   = (p.textContent for p in @node.getElementsByTagName("p")).join("\n")
    @depth     = @node.className.substr(-1).parseInt()
    @name      = @extractName()
    @link      = @extractLink()
    @timestamp = @extractTimestamp()

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
    year   = year.parseInt()  + 2000
    month  = month.parseInt() - 1
    hours  = hours.parseInt() + 5
    hours += 12 if ampm is "PM"
    new Date(Date.UTC(year, month, day, hours, minutes, 0))

  # Filters are organized together to make it easier
  filterName:    => Filter.dialog "string", "name", @name
  filterLink:    => Filter.dialog "string", "link", @link
  filterContent: -> Filter.dialog "string", "content"
  filterCustom:  -> Filter.dialog "regex",  "content"
  
  addControls: ->
    nodes = DOMBuilder.create([
      { tag: "span", class: "pipe", text: "|" }
      "filters: "
      {
        tag: "div"
        class: "filters"
        children:
          tag: "ul"
          children: [{
            tag: "li"
            children:
              tag: "a"
              text: "name"
              events:
                click: @filterName
          }, {
            tag: "li"
            children:
              tag: "a"
              text: "link"
              events:
                click: @filterLink
          }, {
            tag: "li"
            children:
              tag: "a"
              text: "content"
              events:
                click: @filterContent
          }, {
            tag: "li"
            children:
              tag: "a"
              text: "custom"
              events:
                click: @filterCustom
          }]
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

  show: ->
    for child in @node.children
      if child.className isnt "filter_explanation"
        child.style.removeProperty "display"
      else
        child.style.setProperty "display", "none"

  hide: ->
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
          text: filter.text
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

  showDepth: ->
    @node.className = @node.className.replace("depth0", "depth#{@depth}")

  hideDepth: ->
    @node.className = @node.className.replace("depth#{@depth}", "depth0")
