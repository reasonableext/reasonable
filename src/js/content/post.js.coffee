class Post
  constructor: (@filters) ->
    @container   = document.getElementById("commentcontainer")
    @comments    = (=>
      if @container?
        for block, index in @container.getElementsByClassName("com-block")
          new Comment(block, index, this)
      else
        null)()
    @is_threaded = yes

  unthread: =>
    @comments_by_timestamp ?= @comments.sort (a, b) -> a.timestamp - b.timestamp
    for comment in @comments_by_timestamp
      @container.appendChild comment.node
      comment.hide_depth()
    @is_threaded = no

  thread: =>
    for comment in @comments
      @container.appendChild comment.node
      comment.show_depth()
    @is_threaded = yes
