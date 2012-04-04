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
        previousComment = null
        for block, index in @container.getElementsByClassName("com-block")
          previousComment = new Comment(block, index, this, previousComment)
      else
        null
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
