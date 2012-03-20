clear_fixtures = ->
  div = document.getElementById("fixtures")
  while div.hasChildNodes()
    div.removeChild div.firstChild

div_for_fixtures = ->
  div = document.getElementById("fixtures")
  unless div?
    div = document.createElement("div")
    div.id = "fixtures"
    document.body.appendChild div
  return div

run_with_fixtures = (targets..., callback) ->
  xml_http  = new XMLHttpRequest()
  responses = []
  for target in targets
    xml_http.open("GET", "spec/fixtures/#{target}", false)
    xml_http.send()
    responses.push xml_http.responseText
  div_for_fixtures().innerHTML = responses.join("\n")

  callback.call()

  clear_fixtures()
