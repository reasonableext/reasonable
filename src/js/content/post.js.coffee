class Post
  @load: (@filters) ->
    @container   = document.getElementById("commentcontainer")
    @comments    = (=>
      if @container?
        for block, index in @container.getElementsByClassName("com-block")
          new Comment(block, index, this)
      else
        null)()
    @isThreaded = yes

  @reload: ->
    @filters = Filter.all
    this

  @runFilters: ->
    for comment in @comments
      comment.toggle not comment.isTroll()

  @unthread: =>
    @commentsByTimestamp ?= @comments.sort (a, b) -> a.timestamp - b.timestamp
    for comment in @commentsByTimestamp
      @container.appendChild comment.node
      comment.hideDepth()
    @isThreaded = no

  @thread: =>
    for comment in @comments
      @container.appendChild comment.node
      comment.showDepth()
    @isThreaded = yes
