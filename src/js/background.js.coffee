MAX_HISTORY = 20
Settings.load()

chrome.extension.onRequest.addListener (request, sender, sendResponse) ->
  switch request.method
    when "settings"
      sendResponse settings: Settings.all()
    when "blockIframes"
      sendResponse Settings.blockIframes
    when "add"
      f = request.filter
      Settings.filters[f.type] ?= name: {}, link: {}, content: {}
      Settings.filters[f.type][f.target] ?= {}
      Settings.filters[f.type][f.target][f.text] = Settings.timestamp()
      Settings.save "filters"
      sendResponse filters: Settings.filters
    when "delete"
      f = request.filter
      delete Settings.filters[f.type][f.target][f.text]
      Settings.save "filters"
      sendResponse filters: Settings.filters
    when "history"
      # Add any items that don't currently exist to history
      for item in request.history
        if (do ->
          for currentItem in Settings.history
            if item.permalink is currentItem.permalink
              return false
          return true)
          Settings.history.push item

      # Sort in reverse chronological order and cull
      Settings.history.sort (a, b) -> b.permalink - a.permalink
      Settings.history.pop() while Settings.history.length > MAX_HISTORY

      Settings.save "history"
      sendResponse history: Settings.history
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

# Show page action icon if we're on reason.com
chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
  chrome.pageAction.show tabId if tab.url.indexOf("reason.com") > -1

# Direct page action clicks to the options page
chrome.pageAction.onClicked.addListener (tab) ->
  chrome.tabs.create url: "options.html"

submitTrolls = ->
#  if settings.shareTrolls
#    current = new Date()

#    if (current.getTime() - settings.submitted) > SUBMIT_DAYS * DAYS_TO_MILLISECONDS
#      black = []
#      white = []
#      auto  = []

#      for troll, value of settings.trolls
#        switch value
#          when actions.black.value then black.push troll
#          when actions.white.value then white.push troll
#          when actions.auto.value  then auto.push  troll

#      $.ajax
#        type: "post"
#        url:  GIVE_URL
#        data:
#          black: black.join ","
#          white: white.join ","
#          auto:  auto.join  ","
#          admin: settings.admin
#          hideAuto: settings.hideAuto
#        dataType: "text"
#        success: (data) ->
#          settings.submitted = current.getTime()
#          localStorage.submitted = JSON.stringify settings.submitted

lookupTrollsOnline = ->
#  $.ajax
#      url: "#{GET_URL}?sensitivity=#{settings.sensitivity}"
#      dataType: "json"
#      success: (data) ->

      temp = JSON.parse localStorage.trolls
#      onlineList = data

      # Remove those no longer listed as trolls
#      for key, value of temp
#        if value is actions.auto.value and key not of onlineList
#          delete temp[key]

      # Add new trolls
#      for key, value of onlineList
#        if key not of temp
#          temp[key] = actions.auto.value

      window.settings.trolls = temp
#      localStorage.trolls = JSON.stringify temp
#      submitTrolls()
#    error: -> submitTrolls()

if settings.hideAuto
  # Lookup trolls online at the specified frequency
  setInterval lookupTrollsOnline, settings.lookupFrequency * MINUTES_TO_MILLISECONDS
  lookupTrollsOnline()
else
  submitTrolls()
