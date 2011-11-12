(function() {
  var DAYS_TO_MILLISECONDS, MINUTES_TO_MILLISECONDS, SUBMIT_DAYS, lookupTrollsOnline, onlineList, submitTrolls;

  window.settings = {};

  onlineList = {};

  SUBMIT_DAYS = 3;

  DAYS_TO_MILLISECONDS = 86400000;

  MINUTES_TO_MILLISECONDS = 60000;

  window.parseSettings = function() {
    var key, temp, value, _ref;
    temp = {};
    for (key in localStorage) {
      value = localStorage[key];
      temp[key] = JSON.parse(value);
    }
    _ref = window.defaultSettings;
    for (key in _ref) {
      value = _ref[key];
      if (temp[key] == null) {
        temp[key] = value;
        localStorage[key] = JSON.stringify(value);
      }
    }
    return window.settings = temp;
  };

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var alreadyExists, datetime, index, value, _ref;
    switch (request.type) {
      case "settings":
        return sendResponse({
          settings: settings
        });
      case "addTroll":
        settings.trolls[request.name] = actions.black.value;
        if (request.link) settings.trolls[request.link] = actions.black.value;
        localStorage.trolls = JSON.stringify(settings.trolls);
        return sendResponse({
          success: true
        });
      case "removeTroll":
        console.log("Whitelisting " + request.name);
        settings.trolls[request.name] = actions.white.value;
        if (request.link !== "") {
          console.log("Whitelisting " + request.link);
          settings.trolls[request.link] = actions.white.value;
        }
        localStorage.trolls = JSON.stringify(settings.trolls);
        return sendResponse({
          success: true
        });
      case "keepHistory":
        datetime = new Date();
        alreadyExists = false;
        _ref = settings.history;
        for (index in _ref) {
          value = _ref[index];
          if (value.permalink >= request.permalink) {
            alreadyExists = true;
            break;
          }
        }
        if (!alreadyExists) {
          while (settings.history.length > QUICKLOAD_MAX_ITEMS) {
            settings.history.shift();
          }
          settings.history.push({
            timestamp: datetime.getTime(),
            url: request.url,
            permalink: request.permalink
          });
        }
        localStorage.history = JSON.stringify(settings.history);
        return sendResponse({
          success: true,
          exists: alreadyExists,
          timestamp: datetime.getTime()
        });
      case "blockIframes":
        return sendResponse(settings.blockIframes);
      case "reset":
        return $.each(request.settings, function(key, value) {
          var temp;
          if (key === "trolls") {
            temp = JSON.parse(localStorage.trolls);
            for (key in value) {
              temp[key] = value[key];
            }
            return localStorage.trolls = JSON.stringify(temp);
          } else if (key === "history") {
            return localStorage.history = JSON.stringify(value);
          } else {
            return localStorage[key] = value;
          }
        });
      default:
        return sendResponse({});
    }
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf("reason.com") > -1) return chrome.pageAction.show(tabId);
  });

  submitTrolls = function() {};

  lookupTrollsOnline = function() {
    var temp;
    temp = JSON.parse(localStorage.trolls);
    return window.settings.trolls = temp;
  };

  window.parseSettings();

  if (settings.hideAuto) {
    setInterval(lookupTrollsOnline, settings.lookupFrequency * MINUTES_TO_MILLISECONDS);
    lookupTrollsOnline();
  } else {
    submitTrolls();
  }

}).call(this);
