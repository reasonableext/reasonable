class PortExt
  listen: (callback) ->
    chrome.extension.onRequest.addListener callback

portExt = new PortExt()
