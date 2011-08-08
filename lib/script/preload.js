const re = /(facebook|twitter)/;

function getSource(obj) {
  if (obj.src) {
    return obj.src;
  } else {
    console.log($(obj).data("src"));
    return $(obj).data("src");
  }
}

chrome.extension.sendRequest({"type": "blockIframes"}, function(response) {
  // Block iframes unless turned off
  if (response) {
    $(document).beforeload(function(e) {
      if (e.target.nodeName.toUpperCase() === "IFRAME") {
        if (re.test(getSource(e.target))) {
          e.preventDefault();
        }
      }        
    });
  }
});