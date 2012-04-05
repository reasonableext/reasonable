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
      @request = (params, callback) ->
        xmlhttp = new XMLHttpRequest()

        if params.method?.toLowerCase() is "post"
          xmlhttp.open "POST", params.url, yes
          xmlhttp.setRequestHeader "Content-type", "application/x-www-form-urlencoded"
        else
          xmlhttp.open "GET", params.url, yes

        if callback?
          xmlhttp.onreadystatechange = ->
            callback() if @readyState is @DONE and @status is 200

      @save = (key, value) ->
        localStorage[key] = JSON.stringify(value)
      @storage = localStorage
      @sendRequest = (request, context, responseCallback) ->
        if responseCallback?
          chrome.extension.sendRequest request, responseCallback
        else
          chrome.extension.sendRequest request

    # Firefox
    else if @firefox
      if require?
        pageMod = require("page-mod")
        request = require("request").Request
        self    = require("self")
        ss      = require("simple-storage")
      
      @addRequestListener = (request, sender, sendResponse) ->
        # implementation pending
      @getURL = (path) ->
        self.data.url(path)
      @load = (key) ->
        ss.storage[key]
      @pageMod = (params) ->
        pageMod.PageMod {
          include: params.include
          contentScriptFile: self.data.url(params.url)
          onAttach: (worker) ->
            console.log "Attaching content scripts"
            worker.on "detach", (data) ->
              console.log data
        }
      @request = (params, callback) ->
        r = request {
          url:        params.url
          content:    params.params
          onComplete: callback
        }
        if params.method?.toLowerCase() is "post"
          r.post()
        else
          r.get()
      @save = (key, value) ->
        ss.storage[key] = value
      @storage = ->
        ss.storage
      @sendRequest = (request, context, responseCallback) ->
        context.postMessage "hi"
        context.removeMessageListener request.method
        context.addMessageListener request.method, (response) ->
          responseCallback response

XBrowser.load()
