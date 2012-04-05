# Some cute monkey patches for code readability later
Number::minutes = -> @ * 60
Number::minute  = Number::minute
Number::hours   = -> @ * 3600
Number::hour    = Number::hours
Number::days    = -> @ * 86400
Number::day     = Number::days

Settings.load()

class Background
  @MAX_HISTORY:  15
  @SEND_URL:     "http://www.brymck.com/reasonable/send"
  @RETRIEVE_URL: "http://www.brymck.com/reasonable/retrieve"

  @load: ->
    XBrowser.addRequestListener (request, sender, sendResponse) =>
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
          @sendList()
        when "delete"
          f = request.filter
          delete Settings.filters[f.type][f.target][f.text]
          Settings.save "filters"
          sendResponse filters: Settings.filters
          @sendList()
        when "update"
          filters = request.filters
          for f in filters
            Settings.filters[f.type]?[f.target]?[f.text] = Settings.timestamp()
          Settings.save "filters"
          @sendList()
        when "url"
          result = request.url is Settings.previousURL
          Settings.previousURL = request.url
          Settings.save "previousURL"
          sendResponse result
        when "history"
          # Add any items that don't currently exist to history
          for item in request.history
            if (do ->
              for currentItem in Settings.history
                if item.permalink is currentItem.permalink
                  return no
              return yes)
              Settings.history.push item

          # Sort in reverse chronological order and cull
          Settings.history.sort (a, b) -> b.permalink - a.permalink
          Settings.history.pop() while Settings.history.length > @MAX_HISTORY

          Settings.save "history"
          sendResponse history: Settings.history
        else
          sendResponse {} # snub

    if XBrowser.chrome
      # Show page action icon if we're on reason.com
      chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) ->
        chrome.pageAction.show tabId if tab.url.indexOf("reason.com") > -1

      # Direct page action clicks to the options page
      chrome.pageAction.onClicked.addListener (tab) ->
        chrome.tabs.create url: "options.html"

    @retrieveList()

  @sendList: ->
    return unless Settings.shareTrolls
    now = Settings.timestamp()
    return unless now - Settings.submitted > 1.hour()
    result =
      string:
        name:    {}
        link:    {}
        content: {}
      regex:
        name:    {}
        link:    {}
        content: {}
    for own type, targets of Settings.filters
      for own target, texts of targets
        for own text, timestamp of texts
          if timestamp > Settings.submitted
            result[type][target][text] = timestamp
    xmlhttp = new XMLHttpRequest()
    xmlhttp.open "POST", @SEND_URL, yes
    xmlhttp.setRequestHeader "Content-type", "application/x-www-form-urlencoded"
    xmlhttp.send "id=#{Settings.userID}&filters=#{encodeURIComponent(JSON.stringify(result))}"
    Settings.submitted = Settings.timestamp()
    Settings.save "submitted"

  @retrieveList: ->
    return unless Settings.hideAuto
    xmlhttp = new XMLHttpRequest()
    xmlhttp.open "GET", @RETRIEVE_URL, yes

    xmlhttp.onreadystatechange = ->
      if @readyState is @DONE and @status is 200
        result = JSON.parse(@responseText)
        timestamp = Settings.timestamp() - 7.days()
        for own type, targets of result
          for own target, texts of targets
            for text in texts
              unless text of Settings.autoFilters[type][target]
                Settings.autoFilters[type][target][text] = timestamp
                Settings.filters[type][target][text]     = timestamp
        Settings.save "autoFilters"
        Settings.save "filters"

    xmlhttp.send null

Background.load()
