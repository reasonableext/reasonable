class Post
  constructor: ->
    @comments = extract_comments()
    
  extract_comments = ->
    container = document.getElementById("commentcontainer")
    if container?
      for block in container.getElementsByClassName("com-block")
        new Comment(block)
    else
      null
