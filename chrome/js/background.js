var DAYS_TO_MILLISECONDS, MINUTES_TO_MILLISECONDS, SUBMIT_DAYS, lookupTrollsOnline, onlineList, parseSettings, submitTrolls;
window.settings = {};
onlineList = {};
SUBMIT_DAYS = 3;
DAYS_TO_MILLISECONDS = 86400000;
MINUTES_TO_MILLISECONDS = 60000;
parseSettings = function() {
  var key, temp, value, _ref;
  temp = {};
  for (key in localStorage) {
    value = localStorage[key];
    try {
      temp[key] = JSON.parse(value);
    } catch (error) {
      temp[key] = value;
    }
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
      $.ajax({
        type: "post",
        url: GIVE_URL,
        data: {
          black: request.name + (request.link ? "," + request.link : ""),
          white: "",
          auto: "",
          admin: settings.admin,
          hideAuto: settings.hideAuto
        }
      });
      return sendResponse({
        success: true
      });
    case "removeTroll":
      if (request.name in settings.trolls) {
        if (request.name in onlineList) {
          settings.trolls[request.name] = actions.white.value;
        } else {
          delete settings.trolls[request.name];
        }
      }
      if (request.link in settings.trolls) {
        if (request.link in onlineList) {
          settings.trolls[request.link] = actions.white.value;
        } else {
          delete settings.trolls[request.link];
        }
      }
      localStorage.trolls = JSON.stringify(settings.trolls);
      $.ajax({
        type: "post",
        url: GIVE_URL,
        data: {
          black: "",
          white: request.name + (request.link ? "," + request.link : ""),
          auto: "",
          admin: settings.admin,
          hideAuto: settings.hideAuto
        }
      });
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
submitTrolls = function() {
  var auto, black, current, troll, value, white, _ref;
  if (settings.shareTrolls) {
    current = new Date();
    if ((current.getTime() - settings.submitted) > SUBMIT_DAYS * DAYS_TO_MILLISECONDS) {
      black = [];
      white = [];
      auto = [];
      _ref = settings.trolls;
      for (troll in _ref) {
        value = _ref[troll];
        switch (value) {
          case actions.black.value:
            black.push(troll);
            break;
          case actions.white.value:
            white.push(troll);
            break;
          case actions.auto.value:
            auto.push(troll);
        }
      }
      return $.ajax({
        type: "post",
        url: GIVE_URL,
        data: {
          black: black.join(","),
          white: white.join(","),
          auto: auto.join(","),
          admin: settings.admin,
          hideAuto: settings.hideAuto
        },
        dataType: "text",
        success: function(data) {
          settings.submitted = current.getTime();
          return localStorage.submitted = JSON.stringify(settings.submitted);
        }
      });
    }
  }
};
lookupTrollsOnline = function() {
  return $.ajax({
    url: GET_URL,
    dataType: "json",
    success: function(data) {
      var key, temp, value;
      temp = JSON.parse(localStorage.trolls);
      onlineList = data;
      for (key in temp) {
        value = temp[key];
        if (value === actions.auto.value && !(key in onlineList)) delete temp[key];
      }
      for (key in onlineList) {
        value = onlineList[key];
        if (!(key in temp)) temp[key] = actions.auto.value;
      }
      window.settings.trolls = temp;
      localStorage.trolls = JSON.stringify(temp);
      return submitTrolls();
    },
    error: function() {
      return submitTrolls();
    }
  });
};
parseSettings();
if (settings.hideAuto) {
  lookupTrollsOnline();
  setInterval(lookupTrollsOnline, settings.lookupFrequency * MINUTES_TO_MILLISECONDS);
} else {
  submitTrolls();
}