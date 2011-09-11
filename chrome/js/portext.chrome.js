var PortExt, portExt;
PortExt = (function() {
  function PortExt() {}
  PortExt.prototype.listen = function(callback) {
    return chrome.extension.onRequest.addListener(callback);
  };
  return PortExt;
})();
portExt = new PortExt();