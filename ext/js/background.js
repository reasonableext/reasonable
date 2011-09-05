(function() {
  var DAYS_TO_MILLISECONDS, SUBMIT_DAYS, buildTrolls, parseSettings;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (__hasProp.call(this, i) && this[i] === item) return i;
    }
    return -1;
  };
  window.settings = {};
  window.trolls = [];
  SUBMIT_DAYS = 3;
  DAYS_TO_MILLISECONDS = 86400000;
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var alreadyExists, datetime, temp, _ref, _ref2;
    switch (request.type) {
      case "settings":
        return sendResponse({
          settings: window.settings
        });
      case "addTroll":
        window.settings.trolls[request.name] = actions.black.value;
        if (request.link) {
          window.settings.trolls[request.link] = actions.black.value;
        }
        localStorage.trolls = JSON.stringify(window.settings.trolls);
        $.ajax({
          type: "post",
          url: GIVE_URL,
          data: {
            black: request.name + (request.link ? "," + request.link : ""),
            white: "",
            auto: "",
            hideAuto: localStorage.hideAuto
          }
        });
        return sendResponse({
          success: true
        });
      case "removeTroll":
        if (_ref = request.name, __indexOf.call(window.settings.trolls, _ref) >= 0) {
          delete window.settings.trolls[request.name];
        }
        if (_ref2 = request.link, __indexOf.call(window.settings.trolls, _ref2) >= 0) {
          delete window.settings.trolls[request.link];
        }
        localStorage.trolls = JSON.stringify(window.settings.trolls);
        $.ajax({
          type: "post",
          url: GIVE_URL,
          data: {
            black: "",
            white: request.name + (request.link ? "," + request.link : ""),
            auto: "",
            hideAuto: localStorage.hideAuto
          }
        });
        return sendResponse({
          success: true
        });
      case "keepHistory":
        datetime = new Date();
        alreadyExists = false;
        temp = localStorage.history ? JSON.parse(localStorage.history) : [];
        $.each(temp, function(index, value) {
          if (value.permalink >= request.permalink) return alreadyExists = true;
        });
        if (!alreadyExists) {
          while (temp.length > QUICKLOAD_MAX_ITEMS) {
            temp.shift();
          }
          temp.push({
            timestamp: datetime.getTime(),
            url: request.url,
            permalink: request.permalink
          });
        }
        localStorage.history = JSON.stringify(temp);
        return sendResponse({
          success: true,
          exists: alreadyExists,
          timestamp: datetime.getTime()
        });
      case "blockIframes":
        return sendResponse(localStorage.blockIframes === "true");
      case "reset":
        return $.each(request.settings, function(key, value) {
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
  buildTrolls = function() {
    var auto, black, current, troll, value, white, _ref;
    black = [];
    white = [];
    auto = [];
    _ref = window.settings.trolls;
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
    current = new Date();
    if (localStorage.submitted == null) localStorage.submitted = 0;
    if (localStorage.shareTrolls) {
      if (current.getTime() - localStorage.submitted > SUBMIT_DAYS * DAYS_TO_MILLISECONDS) {
        return $.ajax({
          type: "post",
          url: GIVE_URL,
          data: {
            black: black.join(","),
            white: white.join(","),
            auto: auto.join(","),
            hideAuto: localStorage.hideAuto
          },
          dataType: "text",
          success: function(data) {
            return localStorage.submitted = current.getTime();
          }
        });
      }
    }
  };
  parseSettings = function() {
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
  parseSettings();
  if (localStorage.shareTrolls) {
    $.ajax({
      url: GET_URL,
      dataType: "json",
      success: function(data) {
        var key, onlineList, temp, value;
        temp = JSON.parse(localStorage.trolls);
        onlineList = data;
        for (key in temp) {
          value = temp[key];
          if (value === actions.auto.value && !(key in onlineList)) {
            delete temp[key];
          }
        }
        for (key in onlineList) {
          value = onlineList[key];
          if (!(key in temp)) temp[key] = actions.auto.value;
        }
        window.settings.trolls = temp;
        localStorage.trolls = JSON.stringify(temp);
        return buildTrolls();
      },
      error: function() {
        return buildTrolls();
      }
    });
  } else {
    buildTrolls();
  }
}).call(this);
