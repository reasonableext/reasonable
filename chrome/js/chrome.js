var PortEx, port;
PortEx = (function() {
  function PortEx() {}
  PortEx.prototype.listen = function(callback) {
    return chrome.extension.onRequest.addListener(callback);
  };
  return PortEx;
})();
port = new PortEx();