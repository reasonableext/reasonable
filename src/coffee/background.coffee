window.settings = {}
window.trolls = []
SUBMIT_DAYS = 3
DAYS_TO_MILLISECONDS = 86400000

chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
  switch request.type
    when "settings"
      sendResponse { settings: window.settings }
    when "addTroll"
      window.settings.trolls[request.name] = actions.black.value
      window.settings.trolls[request.link] = actions.black.value if request.link
      localStorage.trolls = JSON.stringify window.settings.trolls
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
      if request.name in window.settings.trolls
        delete window.settings.trolls[request.name]
      if request.link in window.settings.trolls
        delete window.settings.trolls[request.link]
      localStorage.trolls = JSON.stringify window.settings.trolls
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
  chrome.pageAction.show tabId if tab.url.indexOf("reason.com") > -1

buildTrolls = ->
  black = []
  white = []
  auto  = []

  for troll, value of window.settings.trolls
    switch value
      when actions.black.value then black.push troll
      when actions.white.value then white.push troll
      when actions.auto.value  then auto.push  troll

  current = new Date()
  localStorage.submitted = 0 unless localStorage.submitted?

  if localStorage.shareTrolls
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

parseSettings = ->
  temp = {}
  temp[key] = JSON.parse(value) for key, value of localStorage

  for key, value of window.defaultSettings
    # Set undefined settings to defaults
    unless temp[key]?
      temp[key] = value
      localStorage[key] = JSON.stringify value

  # Store temp object to settings
  window.settings = temp

parseSettings()

if localStorage.shareTrolls
  $.ajax
    url: GET_URL
    dataType: "json"
    success: (data) ->

      temp = JSON.parse localStorage.trolls
      onlineList = data

      # Remove those no longer listed as trolls
      for key, value of temp
        if value is actions.auto.value and key not of onlineList
          delete temp[key]

      # Add new trolls
      for key, value of onlineList
        if key not of temp
          temp[key] = actions.auto.value

      window.settings.trolls = temp
      localStorage.trolls = JSON.stringify temp
      buildTrolls()
    error: () ->
      buildTrolls()
else
  buildTrolls()
