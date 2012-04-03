chrome.extension.sendRequest method: "blockIframes", (response) ->
  # Block iframes unless turned off
  if response
    window.onload = (event) ->
      social = (node for node in document.getElementsByClassName("social"))
      node.parentNode.removeChild node for node in social
