window.trolls
SUBMIT_DAYS = 3
DAYS_TO_MILLISECONDS = 86400000

chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
  switch request.type
    when "settings"
      sendResponse { settings: localStorage, trolls: troll }
    when "addTroll"
      temp = JSON.parse localStorage.trolls
      temp[request.name] = actions.black.value
      temp[request.link] = actions.black.value if request.link
      localStorage.trolls = JSON.stringify temp
      $.ajax
        type: "post"
        url: GIVE_URL
        data:
          black: request.name + (if request.link then ",#{request.link}" else "")
          white: ""
          auto: ""
          hideAuto: localStorage.hideAuto
      sendResponse { success: true }
    when "removeTroll"
      temp = JSON.parse localStorage.trolls
      if request.name in temp
        if request.name in trolls
          temp[request.name] = actions.white.value
        else
          delete temp[request.name]
      if request.link in temp
        if request.link in trolls
          temp[request.link] = actions.white.value
        else
          delete temp[request.link]
      localStorage.trolls = JSON.stringify temp
      $.ajax
        type: "post"
        url: GIVE_URL
        data:
          black: ""
          white: request.name + (if request.link then ",#{request.link}" else ""),
          auto: ""
          hideAuto: localStorage.hideAuto
      sendResponse { success: true }
    when "keepHistory"
      datetime      = new Date()
      alreadyExists = false
      
      temp = if localStorage.history then JSON.parse localStorage.history else []

      # Ignore if permalink was from a point in the past or is identical to one
      # that already exists. This prevents old posts from showing up with a current
      # timestamp
      $.each temp, (index, value) ->
        alreadyExists = true if value.permalink >= request.permalink

      # Delete old items, then add to history if comment was not already there
      unless alreadyExists
        temp.shift() while temp.length > QUICKLOAD_MAX_ITEMS
        temp.push { timestamp: datetime.getTime(), url: request.url, permalink: request.permalink }
      
      localStorage.history = JSON.stringify temp
      sendResponse { success: true, exists: alreadyExists, timestamp: datetime.getTime() }
    when "blockIframes"
      sendResponse localStorage.blockIframes is "true"
    when "reset"
      $.each request.settings, (key, value) ->
        if key is "trolls"
          temp = JSON.parse localStorage.trolls
          temp[key] = value[key] for key of value
          localStorage.trolls = JSON.stringify temp
        else if key is "history"
          localStorage.history = JSON.stringify value
        else
          localStorage[key] = value
    else
      sendResponse {} # snub

chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
  chrome.pageAction.show tabId if tab.url.indexOf "reason.com" > -1

if localStorage.shareTrolls
  black = []
  white = []
  auto  = []
  temp  = JSON.parse localStorage.trolls

  for troll of temp
    switch temp[troll]
      when actions.black.value then black.push troll
      when actions.white.value then white.push troll
      when actions.auto.value  then auto.push  troll

  current = new Date()
  localStorage.submitted = 0 unless localStorage.submitted?

  if current.getTime() - localStorage.submitted > SUBMIT_DAYS * DAYS_TO_MILLISECONDS
    $.ajax
      type: "post"
      url:  GIVE_URL
      data:
        black: black.join ","
        white: white.join ","
        auto:  auto.join  ","
        hideAuto: localStorage.hideAuto
      dataType: "text"
      success: (data) -> localStorage.submitted = current.getTime()

$.ajax
  url: GET_URL
  dataType: "json"
  success: (data) ->
    try
      temp = JSON.parse localStorage.trolls

      # Remove non-trolls and add new trolls
      $.each temp, (key, value) -> delete temp[key] if value is "auto" and key not of data
      $.each temp, (key, value) -> temp[key] = "auto" if key not of temp

      trolls = temp
      localStorage.temp = JSON.stringify temp
  error: () -> trolls = {}
