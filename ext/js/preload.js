(function() {
  var getSource, re;

  re = /(facebook|twitter)/;

  getSource = function(obj) {
    return obj.src || $(obj).data("src");
  };

  chrome.extension.sendRequest({
    type: "blockIframes"
  }, function(response) {
    if (response) {
      return $(document).beforeload(function(event) {
        if (event.target.nodeName.toUpperCase() === "IFRAME" && re.test(getSource(event.target))) {
          return event.preventDefault();
        }
      });
    }
  });

}).call(this);
