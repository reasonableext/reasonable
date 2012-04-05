class History
  @load: ->
    @items = []
    XBrowser.sendRequest method: "history", history: @serialize(), self, (response) =>
      Controls.addHistory response.history if Settings.showHistory

  @serialize: ->
    url = window.location.href.replace(/\#.*$/, "")
    return {} unless Post.comments?
    result = []
    for comment in Post.comments
      if comment.isMe
        result.push
          url:       url
          permalink: comment.id
          timestamp: comment.timestamp
    return result
