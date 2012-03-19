class Comment
  constructor: (node) ->
    @id        = parseInt(node.id.replace("comment_", ""))
    header     = node.getElementsByTagName("h2")[0]
    @content   = (p.textContent for p in node.getElementsByTagName("p")).join("\n")
    @timestamp = extract_date(header.textContent)

  # private

  extract_date = (text) ->
    matches = text.match(/(\d+)\.(\d+)\.(\d+) \@ (\d+):(\d+)(AM|PM)/)
    [_, month, day, year, hours, minutes, ampm] = matches
    year   = parseInt(year)  + 2000
    month  = parseInt(month) - 1
    hours  = parseInt(hours) + 5
    hours += 12 if ampm is "PM"
    new Date(Date.UTC(year, month, day, hours, minutes, 0))
