class Comment.YouTubeExtension
  REGEX: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)(?:\#t\=[0-9]{2}m[0-9]{2}s)?/gi

  run: (comment) ->
    for a in comment.body.getElementsByTagName("a")
      text     = a.href
      nextNode = a.parentNode.nextSibling
      if a.parentNode.tagName.toLowerCase() is "p" and matches = @REGEX.exec(text)
        youTube = document.createElement("iframe")
        youTube.className = "youtube-player"
        youTube.title = "YouTube video player"
        youTube.type = "text/html"
        youTube.width = 480
        youTube.height = 390
        youTube.src = "https://www.youtube.com/embed/#{matches[1]}"
        youTube.frameborder = 0

        nextNode.parentNode.insertBefore youTube, nextNode
