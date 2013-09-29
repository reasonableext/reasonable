String::parseInt = ->
  parseInt this, 10

String::truncate = (n) ->
  if @length > n
    "#{@substr 0, n - 3}..."
  else
    this
