const SUBMIT_DAYS = 3;
const DAYS_TO_MILLISECONDS = 86400000;
var trolls;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "settings":
      if (localStorage) {
        sendResponse({
          settings: localStorage,
          trolls: trolls
        });
      } else {
        sendResponse({trolls: trolls});
      }
      break;
    case "addTroll":
      var temp = JSON.parse(localStorage.trolls);
      temp[request.name] = actions.black.value;
      if (request.link) {
        temp[request.link] = actions.black.value;
      }
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
      sendResponse({success: true});
      break;
    case "removeTroll":
      var temp = JSON.parse(localStorage.trolls);
      if (request.name in temp) {
        if (request.name in trolls) {
          temp[request.name] = actions.white.value;
        } else {
          delete temp[request.name];
        }
      }
      if (request.link in temp) {
        if (request.link in trolls) {
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
      sendResponse({success: true});
      break;
    case "keepHistory":
      var temp;
      var datetime = new Date();
      var alreadyExists = false;
      
      // Load history if it exists, otherwise set up a temp array
      if (localStorage.history) {
        temp = JSON.parse(localStorage.history);
      } else {
        temp = [];
      }
      
      $.each(temp, function(index, value) {
        // Ignore if permalink was from a point in the past or
        // is identical to one that already exists
        // This prevents old posts from showing up with a current timestamp
        if (value.permalink >= request.permalink) {
          alreadyExists = true;
        }
      });

      // Add to history if comment was not already there
      if (!alreadyExists) {
        // Limit history length
        while (temp.length > QUICKLOAD_MAX_ITEMS) {
          temp.shift();
        }
        
        temp.push({timestamp: datetime.getTime(), url: request.url, permalink: request.permalink});
      }
      localStorage.history = JSON.stringify(temp);
      sendResponse({success: true, exists: alreadyExists, timestamp: datetime.getTime()});
      break;
    case "blockIframes":
      // Send boolean response
      sendResponse(localStorage.blockIframes === "true");
      break;
    case "reset":
      $.each(request.settings, function(key, value) {
        if (key === "trolls") {
          // Make sure we don't accidentally delete any trolls
          var temp = JSON.parse(localStorage.trolls);
          for (var key in value) {
            temp[key] = value[key];
          }
          localStorage.trolls = JSON.stringify(temp);
        } else if (key === "history") {
          localStorage.history = JSON.stringify(value);
        } else {
          localStorage[key] = value;
        }
      });
      break;
     default:
      sendResponse({}); // snub
      break;
  }
});

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url.indexOf("reason.com") > -1) {
    chrome.pageAction.show(tabId);
  }
});

// Main routine
if (localStorage.shareTrolls) {
  var black = [];
  var white = [];
  var auto = [];
  var temp = JSON.parse(localStorage.trolls);
  
  for (var troll in temp) {
    switch (temp[troll]) {
      case actions.black.value:
        black.push(troll);
        break;
      case actions.white.value:
        white.push(troll);
        break;
      case actions.auto.value:
        auto.push(troll);
        break;
      default:
        break;
    }
  }
  
  var current = new Date();
  if (localStorage.submitted == undefined) {
    localStorage.submitted = 0;
  }
  
  // Only share troll list every set number of days
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
        // Set submission time in local storage
        localStorage.submitted = current.getTime();
      },
      error: function(data) {
        // error handler
      }
    });
  }
}

$.ajax({
  url: GET_URL,
  dataType: "json",
  success: function(data) {
    try {
      var temp = JSON.parse(localStorage.trolls);
      
      // Remove non-trolls
      $.each(temp, function(key, value) {
        if (value === "auto" && !(key in data)) {
          delete temp[key];
        }
      });
      
      // Add new trolls
      $.each(data, function(key, value) {
        if (!(key in temp)) {
          temp[key] = "auto";
        }
      });
      
      trolls = temp;
      localStorage.trolls = JSON.stringify(temp);
    } catch(e) {
      // error handler
    }
  },
  error: function() {
    trolls = {};
  }
});
