re = /(facebook|twitter)/

getSource = (obj) ->
  if obj.src then obj.src else $(obj).data "src"

chrome.extension.sendRequest { type: "blockIframes" }, (response) ->
  # Block iframes unless turned off
  if response
    $(document).beforeload (event) ->
      if event.target.nodeName.toUpperCase() is "IFRAME" and re.text getSource event.target
        event.preventDefault()
