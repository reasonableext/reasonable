class Comment
  constructor: (node) ->
    @id        = node.id.replace("comment_", "").parse_int()
    header     = node.getElementsByTagName("h2")[0]
    @content   = (p.textContent for p in node.getElementsByTagName("p")).join("\n")
    @timestamp = extract_date(header.textContent)
    @depth     = node.className.substr(-1).parse_int()

  extract_date: (text) ->
    matches = text.match(/(\d+)\.(\d+)\.(\d+) \@ (\d+):(\d+)(AM|PM)/)
    [_, month, day, year, hours, minutes, ampm] = matches
    year   = year.parse_int()  + 2000
    month  = month.parse_int() - 1
    hours  = hours.parse_int() + 5
    hours += 12 if ampm is "PM"
    new Date(Date.UTC(year, month, day, hours, minutes, 0))
