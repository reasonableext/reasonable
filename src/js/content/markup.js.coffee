class Markup
  constructor: (@node, @id) ->
    @textarea = @node.getElementsByTagName("textarea")[0]
    oldNodes = (node for node in @node.getElementsByClassName("ableQuick"))
    for node in oldNodes
      node.parentNode.removeChild node

    @addShortcut "link",   "a", URL: "href"
    @addShortcut "quote",  "blockquote"
    @addShortcut "bold",   "b"
    @addShortcut "italic", "i"
    @addShortcut "strike", "s"
    @countCharacters()

  countCharacters: ->
    oldNodes = (node for node in @node.getElementsByClassName("ableCount"))
    for node in oldNodes
      node.parentNode.removeChild node

    div    = document.createElement("div")
    @count = document.createElement("input")
    label  = document.createElement("label")
    text   = document.createTextNode("characters")

    div.className = "ableCount"
    @count.id       = @id
    @count.readonly = yes
    @count.size     = 3
    @count.type     = "text"
    @count.value    = @textarea.value.length
    label.for       = @id
    
    @textarea.onkeyup = => @count.value = @textarea.value.length

    label.appendChild text
    div.appendChild   @count
    div.appendChild   label
    @textarea.parentNode.insertBefore div, @textarea.nextSibling

  addShortcut: (name, tag, attrs = {}) ->
    unless @shortcuts?
      @shortcuts = document.createElement("ul")
      @shortcuts.className = "ableQuick"
      @textarea.parentNode.insertBefore @shortcuts, @textarea
    li = document.createElement("li")
    a  = document.createElement("a")
    text = document.createTextNode(name)

    a.onclick = => @insertTag tag, attrs

    a.appendChild text
    li.appendChild a
    @shortcuts.appendChild li

  insertTag: (tag, attrs) ->
    text      = @textarea.value
    startPos  = @textarea.selectionStart
    endPos    = @textarea.selectionEnd
    startText = text.substr(0, startPos)
    midText   = text.substr(startPos, endPos - startPos)
    endText   = text.substr(endPos)

    startTag = "<#{tag}"
    endTag = "</#{tag}>"

    if attrs?
      for own name, attr of attrs
        result = prompt("Enter #{name}:")
        return unless result?
        startTag += " #{attr}=\"#{result}\""

    startTag += ">"
    @textarea.value = startText + startTag + midText + endTag + endText
    @textarea.focus()
    @textarea.selectionStart = startPos + startTag.length
    @textarea.selectionEnd   = endPos   + startTag.length

  @load: ->
    @main = new Markup(document.getElementById("commentform"), "markup_main")
    for button in document.getElementsByClassName("comment_reply")
      button.onclick = =>
        # The nodes aren't created instantly, so I need to wait a second before adding stuff
        setTimeout (=>
          floatingNode = document.getElementsByClassName("leave-comment reply")[0]
          @floating ?= new Markup(floatingNode, "markup_floating")), 50
