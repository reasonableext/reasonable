updatePosts = ->
  if settings.updatePosts
    $.ajax
      url: window.location.href
      success: (data) ->
        re = /<div class=\"com-block[\s\S]*?<\/div>[\s\S]*?<\/div>/gim
        idRe = /id=\"(comment_[0-9].*?)\"/
        match = re.exec data
        comments = []
        $curNode
        $prevNode = null
        $container = $ "#commentcontainer"
        updateLinks = false

        while match?
          ids = idRe.exec match
          comments.push { html: match, id: ids[1] }
          match = re.exec data

        $.each comments, () ->
          html     = this.html.toString().replace(/\/\/[\s\S]*?\]\]>/, "temp")
          $curNode = $("#" + this.id)

          if $curNode.size() is 0
            updateLinks = true
            if $prevNode?
              $prevNode.after html
              $prevNode = $prevNode.next()
            else
              $container.append html
              $prevNode = $container.children "div:first"
          else $prevNode = $curNode

        viewThread()
        blockTrolls false

    setTimeout updatePosts, UPDATE_POST_TIMEOUT_LENGTH
