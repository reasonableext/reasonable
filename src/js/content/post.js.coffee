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

    @comments    = do =>
      if @container?
        # Determine whether or not to determine the last read ID
        if Settings.markUnread
          url       = window.location.pathname.split("/").pop()
          lastID    = Settings.lastIDs[url]?[0] or 0
          newLastID = lastID
        isMarking = (lastID? and lastID isnt 0)

        # Iterate over comments
        previous = null
        result = for block, index in @container.getElementsByClassName("com-block")
          comment  = new Comment(block, index, this, previous)
          comment.markIfUnread(lastID) if isMarking
          newLastID = comment.id if Settings.markUnread and comment.id > newLastID
          previous = comment

        # Report the last ID of the page
        if Settings.markUnread
          XBrowser.sendRequest method: "lastIDs", url: url, lastID: newLastID

      result ? null
    @isThreaded = yes

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
