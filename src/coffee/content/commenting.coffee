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
