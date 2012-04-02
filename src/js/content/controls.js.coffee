class Controls
  @load: ->
    @node    = document.createElement("div")
    @node.id = "ableControls"
    @ul      = document.createElement("ul")
    @node.appendChild @ul

    @addControl "Unthread", ->
      if @textContent is "Unthread"
        @textContent = "Thread"
        Post.unthread()
      else
        @textContent = "Unthread"
        Post.thread()

    document.body.appendChild @node

  @addControl: (name, callback) ->
    li   = document.createElement("li")
    a    = document.createElement("a")
    text = document.createTextNode(name)

    a.onclick = callback

    a.appendChild text
    li.appendChild a
    @ul.appendChild li
