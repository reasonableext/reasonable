(function() {
  var commentOnlyRoutines, getSettings;
  getSettings = function(response, defaults) {
    var arr, key, reset, settings, temp, value, _ref;
    reset = false;
    temp = (_ref = response.settings) != null ? _ref : {};
    for (key in defaults) {
      value = defaults[key];
      switch (temp[key]) {
        case void 0:
          temp[key] = value;
          reset = true;
          break;
        case "true":
          temp[key] = true;
          break;
        case "false":
          temp[key] = false;
          break;
        default:
          switch (key) {
            case "trolls":
              arr = JSON.parse(temp.trolls);
              temp.trolls = {};
              $.each(arr, function(trollKey, trollValue) {
                if (trollValue === actions.black.value || (temp.hideAuto && trollValue === actions.auto.value)) {
                  return temp.trolls[trollKey] = trollValue;
                }
              });
              break;
            case "history":
              try {
                temp.history = JSON.parse(temp.history).sort(function(a, b) {
                  return a.permalink - b.permalink;
                });
              } catch (error) {
                temp = [];
              }
          }
      }
    }
    settings = temp;
    if (reset) {
      return chrome.extension.sendRequest({
        type: "reset",
        settings: temp
      });
    }
  };
  commentOnlyRoutines = function() {
    gravatars();
    viewThread();
    blockTrolls(false);
    historyAndHighlight();
    showActivity();
    return setTimeout((function() {
      return updatePosts();
    }), UPDATE_POST_TIMEOUT_LENGTH);
  };
  chrome.extension.sendRequest({
    type: "settings"
  }, function(response) {
    defaultSettings.trolls = response.trolls;
    getSettings(response, defaultSettings);
    removeGooglePlus();
    lightsOut();
    altText();
    showMedia();
    buildQuickInsert();
    if (window.location.href.indexOf("#comment") === -1) {
      buildQuickload();
      return $("div#commentcontrol").one("click", commentOnlyRoutines);
    } else {
      return commentOnlyRoutines();
    }
  });
}).call(this);
