class Controls
  @load: ->
    @node    = document.createElement("div")
    @node.id = "ableControls"

    # Build basic HTML for node, displaying history only if necessary
    if Settings.showHistory
      @node.innerHTML = """
        <h3>History</h3>
        <ul id="ableHistory"></ul>
        <hr>
        """
    else
      @node.innerHTML = ""
    @node.innerHTML += """
        <h3>Commands</h3>
        <ul id="ableCommands"></ul>
        """
    document.body.appendChild @node
    @history  = document.getElementById("ableHistory")
    @commands = document.getElementById("ableCommands")

    @addControl "Unthread", ->
      if @textContent is "Unthread"
        @textContent = "Thread"
        Post.unthread()
      else
        @textContent = "Unthread"
        Post.thread()

  @addControl: (name, callback) ->
    li   = document.createElement("li")
    a    = document.createElement("a")
    text = document.createTextNode(name)

    a.onclick = callback

    a.appendChild text
    li.appendChild a
    @commands.appendChild li

  @addHistory: (history) ->
    for item in history
      shortenedLink = item.href.substr(item.href.lastIndexOf("/") + 1, 20)
      li = document.createElement("li")
      li.innerHTML = """
        <li>
          <a href="#{item.href}#comment_#{item.id}">#{shortenedLink}</a>
        </li>
        """
      @history.appendChild li
