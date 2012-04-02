class History
  @load: ->
    @items = []
    chrome.extension.sendRequest method: "history", history: @serialize(), (response) =>
      Controls.addHistory response.history if Settings.showHistory

  @serialize: ->
    href = window.location.href.replace(/\#.*$/, "")
    for comment in Post.comments.filter((c) -> c.isMe)
      {
        href:      href
        id:        comment.id
        timestamp: comment.timestamp
      }
