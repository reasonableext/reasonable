class Comment.ImageExtension
  REGEX: /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png|bmp))(?:\?([^#]*))?(?:#(.*))?/i

  run: (comment) ->
    for a in comment.node.getElementsByTagName("a")
      text     = a.href
      nextNode = a.parentNode.nextSibling
      if a.parentNode.tagName.toLowerCase() is "p" and @REGEX.test(text)
        image = document.createElement("img")
        image.className = "ableCommentPic"
        image.src = text

        nextNode.parentNode.insertBefore image, nextNode
