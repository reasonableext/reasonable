class XBrowser
  # Detect existence of Chrome and Firefox extension APIs
  @load: ->
    @chrome  = chrome?
    @firefox = not @chrome

    # Chrome
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
      @pageMod = (params) ->
        # snub; this is handled by the manifest

    # Firefox
    else if @firefox
      @pageMod = (params) ->
        pageMod = require("page-mod")
        self    = require("self")

        pageMod.PageMod {
          include: params.include,
          contentScriptFile: self.data.url(params.url)
        }

XBrowser.load()
