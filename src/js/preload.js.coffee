re = /facebook|twitter/

getSource = (obj) ->
  obj.src || obj.dataset["src"]

chrome.extension.sendRequest type: "blockIframes", (response) ->
  # Block iframes unless turned off
  if response
    window.onload = (event) ->
      # Currently doesn't work for Google, which is handled in 
      if event.target.nodeName.toUpperCase() is "IFRAME" and re.test(getSource(event.target))
        event.preventDefault()
