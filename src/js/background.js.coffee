MAX_HISTORY = 15
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
    else
      sendResponse {} # snub

# Show page action icon if we're on reason.com
chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
  chrome.pageAction.show tabId if tab.url.indexOf("reason.com") > -1

# Direct page action clicks to the options page
chrome.pageAction.onClicked.addListener (tab) ->
  chrome.tabs.create url: "options.html"
