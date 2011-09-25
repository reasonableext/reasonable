window.settings = {}
onlineList = {}

SUBMIT_DAYS = 3
DAYS_TO_MILLISECONDS = 86400000
MINUTES_TO_MILLISECONDS = 60000

window.parseSettings = ->
  temp = {}
  temp[key] = JSON.parse(value) for key, value of localStorage

  for key, value of window.defaultSettings
    # Set undefined settings to defaults
    unless temp[key]?
      temp[key] = value
      localStorage[key] = JSON.stringify value

  # Store temp object to settings
  window.settings = temp

chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
  switch request.type
    when "settings"
      sendResponse settings: settings
    when "addTroll"
      settings.trolls[request.name] = actions.black.value
      settings.trolls[request.link] = actions.black.value if request.link
      localStorage.trolls = JSON.stringify settings.trolls
      $.ajax
        type: "post"
        url: GIVE_URL
        data:
          black: request.name + (if request.link then ",#{request.link}" else "")
          white: ""
          auto: ""
          admin: settings.admin
          hideAuto: settings.hideAuto
      sendResponse success: true
    when "removeTroll"
      # If a poster is part of the online troll list we must whitelist him, otherwise
      # his post will only display if the user has remote list access turned off
      if request.name of settings.trolls
        if request.name of onlineList
          settings.trolls[request.name] = actions.white.value
        else
          delete settings.trolls[request.name]
      if request.link of settings.trolls
        if request.link of onlineList
          settings.trolls[request.link] = actions.white.value
        else
          delete settings.trolls[request.link]

      localStorage.trolls = JSON.stringify settings.trolls
      $.ajax
        type: "post"
        url: GIVE_URL
        data:
          black: ""
          white: request.name + (if request.link then ",#{request.link}" else ""),
          auto: ""
          admin: settings.admin
          hideAuto: settings.hideAuto
      sendResponse success: true
    when "keepHistory"
      datetime      = new Date()
      alreadyExists = false
      
      # Ignore if permalink was from a point in the past or is identical to one
      # that already exists. This prevents old posts from showing up with a current
      # timestamp
      for index, value of settings.history
        if value.permalink >= request.permalink
          alreadyExists = true
          break

      # Delete old items, then add to history if comment was not already there
      unless alreadyExists
        settings.history.shift() while settings.history.length > QUICKLOAD_MAX_ITEMS
        settings.history.push timestamp: datetime.getTime(), url: request.url, permalink: request.permalink
      
      localStorage.history = JSON.stringify settings.history
      sendResponse success: true, exists: alreadyExists, timestamp: datetime.getTime()
    when "blockIframes"
      sendResponse settings.blockIframes
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

submitTrolls = ->
  if settings.shareTrolls
    current = new Date()

    if (current.getTime() - settings.submitted) > SUBMIT_DAYS * DAYS_TO_MILLISECONDS
      black = []
      white = []
      auto  = []

      for troll, value of settings.trolls
        switch value
          when actions.black.value then black.push troll
          when actions.white.value then white.push troll
          when actions.auto.value  then auto.push  troll

      $.ajax
        type: "post"
        url:  GIVE_URL
        data:
          black: black.join ","
          white: white.join ","
          auto:  auto.join  ","
          admin: settings.admin
          hideAuto: settings.hideAuto
        dataType: "text"
        success: (data) ->
          settings.submitted = current.getTime()
          localStorage.submitted = JSON.stringify settings.submitted

lookupTrollsOnline = ->
  $.ajax
    url: "#{GET_URL}?sensitivity=#{settings.sensitivity}"
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
      submitTrolls()
    error: -> submitTrolls()

window.parseSettings()

if settings.hideAuto
  # Lookup trolls online at the specified frequency
  setInterval lookupTrollsOnline, settings.lookupFrequency * MINUTES_TO_MILLISECONDS
  lookupTrollsOnline()
else
  submitTrolls()
