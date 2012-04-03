class Post
  @load: (@filters) ->
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
    if @comments
      for comment in @comments
        comment.toggle not comment.isTroll()

  @runEverything: ->
    if @comments?
      for comment in @comments
        comment.runExtensions()
        comment.addControls()
        comment.toggle not comment.isTroll()

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
