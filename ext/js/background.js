(function() {
  var DAYS_TO_MILLISECONDS, SUBMIT_DAYS, auto, black, current, temp, troll, white;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (__hasProp.call(this, i) && this[i] === item) return i;
    }
    return -1;
  };
  window.trolls;
  window.onlineList = {};
  SUBMIT_DAYS = 3;
  DAYS_TO_MILLISECONDS = 86400000;
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var alreadyExists, datetime, temp, _ref, _ref2, _ref3, _ref4;
    switch (request.type) {
      case "settings":
        return sendResponse({
          settings: localStorage,
          trolls: troll
        });
      case "addTroll":
        temp = JSON.parse(localStorage.trolls);
        temp[request.name] = actions.black.value;
        if (request.link) temp[request.link] = actions.black.value;
        localStorage.trolls = JSON.stringify(temp);
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
        temp = JSON.parse(localStorage.trolls);
        if (_ref = request.name, __indexOf.call(temp, _ref) >= 0) {
          if (_ref2 = request.name, __indexOf.call(trolls, _ref2) >= 0) {
            temp[request.name] = actions.white.value;
          } else {
            delete temp[request.name];
          }
        }
        if (_ref3 = request.link, __indexOf.call(temp, _ref3) >= 0) {
          if (_ref4 = request.link, __indexOf.call(trolls, _ref4) >= 0) {
            temp[request.link] = actions.white.value;
          } else {
            delete temp[request.link];
          }
        }
        localStorage.trolls = JSON.stringify(temp);
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
  if (localStorage.shareTrolls) {
    black = [];
    white = [];
    auto = [];
    temp = JSON.parse(localStorage.trolls);
    for (troll in temp) {
      switch (temp[troll]) {
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
    if (current.getTime() - localStorage.submitted > SUBMIT_DAYS * DAYS_TO_MILLISECONDS) {
      $.ajax({
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
  $.ajax({
    url: GET_URL,
    dataType: "json",
    success: function(data) {
      var trolls;
      console.dir(data);
      try {
        temp = JSON.parse(localStorage.trolls);
        window.onlineList = data;
        $.each(temp, function(key, value) {
          if (value === "auto" && !(key in onlineList)) return delete temp[key];
        });
        $.each(temp, function(key, value) {
          if (!(key in temp)) return temp[key] = "auto";
        });
        trolls = temp;
        return localStorage.temp = JSON.stringify(temp);
      } catch (_error) {}
    },
    error: function() {
      var trolls;
      return trolls = {};
    }
  });
}).call(this);
