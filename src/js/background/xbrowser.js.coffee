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
      @load = (key) ->
        JSON.parse localStorage[key]
      @pageMod = (params) -> # snub; this is handled by the manifest
      @save = (key, value) ->
        localStorage[key] = JSON.stringify(value)
      @storage = localStorage
      @sendRequest = (request, responseCallback = null) ->
        if responseCallback?
          chrome.extension.sendRequest request, responseCallback
        else
          chrome.extension.sendRequest request

    # Firefox
    else if @firefox
      pageMod = require("page-mod")
      self    = require("self")
      ss      = require("simple-storage")
      
      @load = (key) ->
        ss.storage[key]
      @pageMod = (params) ->
        pageMod.PageMod {
          include: params.include,
          contentScriptFile: self.data.url(params.url)
        }
      @save = (key, value) ->
        ss.storage[key] = value
      @storage = ss.storage

XBrowser.load()
