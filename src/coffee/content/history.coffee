formatDate = (milliseconds) ->
  # Format date like November 23, 1984
  date = new Date milliseconds
  "#{months[date.getMonth()]} #{date.getDate()}, #{date.getFullYear()}"

buildQuickload = ->
  # May load beforehand if comments haven't been opened yet. In that case, make sure
  # this doesn't run again
  if $("#ableQuick").size() is 0
    if settings.history.length > 0
      # Set up quickload bar
      $ul   = $ "<ul>"
      date  = ""
      count = 0

      for value in settings.history
        if count++ <= QUICKLOAD_MAX_ITEMS
          shortenMatch = ARTICLE_SHORTEN_REGEX.exec(value.url)[FIRST_MATCH]
          temp = formatDate value.timestamp

          unless temp is date
            date = temp
            $ul = $ul.prepend """
                              <li>
                                <h4>#{date}</h4>
                                <ul></ul>
                              </li>
                              """

          $ul = $("li:first ul", $ul).prepend("""
                                              <li>
                                                <a href=\"http://reason.com/#{value.url}#comment_#{value.permalink}\">
                                                  #{shortenMatch} (#{value.permalink})
                                                </a>
                                              </li>
                                              """
          ).parent().parent()

      $quickload = $("<div id='ableQuick' class='ableBox'><h3>#{COMMENT_HISTORY}</h3></div>")
        .append($ul)
        .hover ( ()-> $ul.slideDown QUICKLOAD_SPEED ),
               ( ()-> $ul.slideUp   QUICKLOAD_SPEED )
      $("body").append $quickload
