class Post
  constructor: (@node) ->
    @name = node.getElementsByTagName("h2")[0].textContent
    @link = node.getElementsByTagName("a")[0].href

  runExtensions: ->
    if Post.extensions?
      for extension in Post.extensions
        extension.run this

  @load: (@filters) ->
    @posts = (new Post(node) for node in document.getElementsByClassName("post"))
    @container   = document.getElementById("commentcontainer")

    # Determine whether or not to determine the last read ID
    isMarking = no
    if Settings.markUnread
      url       = window.location.pathname.split("/").pop()
      lastID    = Settings.lastIDs[url]?[0]
      if lastID?
        isMarking = yes
      else
        lastID = 0
      newLastID = lastID

    @comments    = do =>
      if @container?
        previous = null
        for block, index in @container.getElementsByClassName("com-block")
          comment  = new Comment(block, index, this, previous)
          comment.markIfUnread(lastID) if isMarking
          newLastID = comment.id if Settings.markUnread and comment.id > newLastID
          previous = comment
      else
        null
    @isThreaded = yes

    if Settings.markUnread
      XBrowser.sendRequest method: "lastIDs", url: url, lastID: newLastID

    this

  @reload: ->
    @filters = Filter.all
    this

  @runFilters: ->
    if @comments?
      for comment in @comments
        comment.toggle not comment.isTroll()
    Filter.updateTimestamps()

  @runEverything: ->
    if @posts?
      for post in @posts
        post.runExtensions()

    if @comments?
      for comment in @comments
        comment.runExtensions()
        comment.addControls()
        comment.toggle not comment.isTroll()
    Filter.updateTimestamps()

  @unthread: =>
    # slice(0) makes a clone of the original comments array
    for comment in @getCommentsByTimestamp()
      @container.appendChild comment.node
      comment.hideDepth()
    @isThreaded = no

  @thread: =>
    for comment in @comments
      @container.appendChild comment.node
      comment.showDepth()
    @isThreaded = yes

  @getCommentsByTimestamp: ->
    @commentsByTimestamp ?= @comments.slice(0).sort (a, b) -> a.timestamp - b.timestamp

  @addExtension: (extension) ->
    @extensions ?= []
    @extensions.push extension
