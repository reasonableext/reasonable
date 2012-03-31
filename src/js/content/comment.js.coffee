class Comment
  constructor: (@node, @index, @post) ->
    @id        = @node.id.replace("comment_", "").parse_int()
    @header    = @node.getElementsByTagName("h2")[0]
    @content   = (p.textContent for p in @node.getElementsByTagName("p")).join("\n")
    @depth     = @node.className.substr(-1).parse_int()
    @timestamp = (=>
      matches = @header.textContent.match(/(\d+)\.(\d+)\.(\d+) \@ (\d+):(\d+)(AM|PM)/)
      [_, month, day, year, hours, minutes, ampm] = matches
      year   = year.parse_int()  + 2000
      month  = month.parse_int() - 1
      hours  = hours.parse_int() + 5
      hours += 12 if ampm is "PM"
      new Date(Date.UTC(year, month, day, hours, minutes, 0)))()
  
  add_controls: ->
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
          }, {
            tag: "li"
            children:
              tag: "a"
              text: "link"
          }, {
            tag: "li"
            children:
              tag: "a"
              text: "content"
          }, {
            tag: "li"
            children:
              tag: "a"
              text: "custom"
          }]
      }
    ])

    @header.appendChild node for node, index in nodes

  is_troll: ->
    @filters = []
    for filter in @post.filters
      if filter.is_troll(this)
        @filters.push filter
    return (@filters.length isnt 0)

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

    unless @explanation?
      options = for filter in @filters
        {
          tag: "li"
          children:
            tag: "a"
            text: filter.text
            events:
              click: -> alert "hi"
        }

      options.push

      @explanation = DOMBuilder.create(
        tag: "div"
        class: "filter_explanation"
        children: [{
          tag: "p"
          text: "Remove filter:"
        }, {
          tag: "ul"
          children: options
        }, {
          tag: "a"
          text: "show once"
          events:
            click: => @show()
        }]
      )

      @node.appendChild(@explanation)

  show_depth: ->
    @node.className = @node.className.replace("depth0", "depth#{@depth}")

  hide_depth: ->
    @node.className = @node.className.replace("depth#{@depth}", "depth0")
