class XBrowser
  # Detect existence of Chrome and Firefox extension APIs
  @load: ->
    @chrome = chrome?
    if @chrome
      @addRequestListener = (request, sender, sendResponse) ->
        if sendResponse?
          chrome.extension.onRequest.addListener request, sender, sendResponse
        else
          chrome.extension.onRequest.addListener request, sender
      @getURL = (path) ->
        chrome.extension.getURL path
      @sendRequest = (request, responseCallback = null) ->
        if responseCallback?
          chrome.extension.sendRequest request, responseCallback
        else
          chrome.extension.sendRequest request

XBrowser.load()
