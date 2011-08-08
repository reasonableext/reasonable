ENTER_KEY = 13
SAVED_SUCCESS_MESSAGE = "Saved successfully!\n\nReload any open reason.com pages to reflect any changes you've made."
$save     = $ "#save"
$troll    = $ "#troll"
trollList = []

sortTrolls = (trolls) ->
  sortFunction = (x, y) ->
    a = String(x).toUpperCase()
    b = String(y).toUpperCase()
    if a > b then 1
    else if a < b then -1
    else 0
  black = []
  white = []
  auto  = []
  temp  = {}

  # Add online troll list to current list
  $.each trollList, (key, value) ->
    trolls[key] = actions.auto.value if key not of trolls
  
  $.each trolls, (key, value) ->
    unless key is ""
      switch value
        when actions.black.value then black.push key
        when actions.white.value then white.push key
        when actions.auto.value  then auto.push  key

  black.sort sortFunction
  white.sort sortFunction
  auto.sort  sortFunction

  $.each black, (index, value) -> temp[value] = actions.black.value
  $.each white, (index, value) -> temp[value] = actions.white.value
  $.each auto,  (index, value) -> temp[value] = actions.auto.value

  localStorage.trolls = JSON.stringify temp
  temp

buildControll = ($td, key, value, comp) ->
  $td.append $("<input").attr
    id: "#{key}_#{comp.value}"
    type: "radio"
    checked: value is comp.value
    name: key
    value: comp.value
  .append $("<label>").attr("for", "#{key}_#{comp.value}").addClass("actions").text comp.label

buildTroll = (key, value) ->
  $trollConstructor = $("<tr>").append $("<td>").addClass("name").text key
  $td = $("<td>").addClass "actions"
  $td = buildControll $td, key, value, actions.black
  $td = buildControll $td, key, value, actions.white
  $td = buildControll $td, key, value, actions.auto
  $td = $td.append $("<button>").addClass("remove").text("X").click () -> $(this).closest("tr").remove()
  $trollConstructor.append $td

addTroll = ->
  $("#trolls tbody").append buildTroll $troll.val(), actions.black.value
  $troll.val null
  false

load = ->
  try
    settings = {}
    settings[key] = localStorage[key] for key of localStorage
    $.each settings, (key, value) ->
      $option = $("##{key}")
      switch $option.attr "id"
        when "trolls"
          trolls = sortTrolls JSON.parse value
          $.each trolls, (tKey, tValue) -> $option.append buildTroll tKey, tValue
        when "name" then $option.val value or ""
        else $option.attr "checked", value is "true"

  if window.location.hash is "#popup"
    $(".scrollContent").fitToWindow 400
  else
    $(".scrollContent").fitToWindow().keepFitToWindow()

save = () ->
  temp = {}
  tempTrolls = {}
  $("#options input[type=checkbox]").each () ->
    $this = $ this
    temp[$this.attr "id"] = Boolean $this.attr "checked"
  $("#options input[type=text]").each () ->
    $this = $ this
    temp[$this.attr "id"] = $this.val()
  $("input:radio:checked").each () ->
    $this = $ this
    tempTrolls[$this.attr "name"] = $this.val()
  temp.trolls = JSON.stringify tempTrolls
  localStorage[key] = temp[key] for key of temp
  alert SAVED_SUCCESS_MESSAGE
  window.close()
  false

$ ->
  $.ajax
    url: GET_URL
    dataType: "json"
    success: (data) ->
      trollList = data
      load()
      $troll.bind "keydown", (event) ->
        addTroll() if event.which is ENTER_KEY
    error: () ->
      trollList = {}
      load()
      $troll.bind "keydown", (event) ->
        addTroll() if event.which is ENTER_KEY
