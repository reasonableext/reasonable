const ENTER_KEY = 13;
const SAVED_SUCCESS_MESSAGE = "Saved successfully!\n\nReload any open reason.com pages to reflect any changes you've made.";
var $save = $("#save");
var $troll = $("#troll");
var trollList = {};

function sortTrolls(trolls) {
  // Sort alphabetically
  var sortFunction = function(x, y) {
    var a = String(x).toUpperCase();
    var b = String(y).toUpperCase();
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  };
  var black = [];
  var white = [];
  var auto = [];
  var temp = {};

  // Add troll list from online to current list
  $.each(trollList, function(key, value) {
    if (!(key in trolls)) {
      trolls[key] = actions.auto.value;
    }
  });
  
  $.each(trolls, function(key, value) {
    if (key !== "") { // Prevent blanks from being stored as trolls
      switch (value) {
        case actions.black.value:
          black.push(key);
          break;
        case actions.white.value:
          white.push(key);
          break;
        case actions.auto.value:
          auto.push(key);
          break;
        default:
          break;
      }
    }
  });

  black.sort(sortFunction);
  white.sort(sortFunction);
  auto.sort(sortFunction);
  
  $.each(black, function(index, value) { temp[value] = actions.black.value; });
  $.each(auto, function(index, value) { temp[value] = actions.auto.value; });
  $.each(white, function(index, value) { temp[value] = actions.white.value; });

  // Save sorted array
  localStorage.trolls = JSON.stringify(temp);
  
  return temp;
}

function buildControll($td, key, value, comp) {
  return $td.append($("<input>").attr({
      id: key + "_" + comp.value,
      type: "radio",
      checked: (value === comp.value),
      name: key,
      value: comp.value
    })).append($("<label>").attr("for", key + "_" + comp.value).addClass("actions").text(comp.label));
}

function buildTroll(key, value) {
  var $trollConstructor = $("<tr>").append($("<td>").addClass("name").text(key));
  var $td = $("<td>").addClass("actions");
  $td = buildControll($td, key, value, actions.black);
  $td = buildControll($td, key, value, actions.white);
  $td = buildControll($td, key, value, actions.auto);
  $td = $td.append($("<button>").addClass("remove").text("X").click(function() { $(this).closest("tr").remove(); }));
  return $trollConstructor.append($td);
}

function addTroll() {
  $("#trolls tbody").append(buildTroll($troll.val(), actions.black.value));
  $troll.val(null);
  return false;
}

function load() {
  try {
    var settings = {};
    for (var key in localStorage) {
      settings[key] = localStorage[key];
    }
    $.each(settings, function(key, value) {
      var $option = $("#" + key);
      switch ($option.attr("id")) {
        case "trolls":
          // Trolls are stored as stringified object
          var trolls = sortTrolls(JSON.parse(value));
          
          // Add each troll to the troll list
          $.each(trolls, function(tkey, tvalue) {
            $option.append(buildTroll(tkey, tvalue));
          });
          break;
        case "name":
          $option.val(value == null ? "" : value);
          break;
        default:
          // Assumes the default is a checkbox
          $option.attr("checked", value == "true");
          break;
      }
    });
  } catch(e) {
  }

  if (window.location.hash === "#popup") {
    $(".scrollContent").fitToWindow(400);
  } else {
    $(".scrollContent").fitToWindow().keepFitToWindow();
  }
}

function save() {
  var temp = {};
  var tempTrolls = {};
  $("#options input[type=checkbox]").each(function() {
    var $this = $(this);
    temp[$this.attr("id")] = Boolean($this.attr("checked"));
  });
  $("#options input[type=text]").each(function() {
    var $this = $(this);
    temp[$this.attr("id")] = $this.val();
  });
  $("input:radio:checked").each(function() {
    tempTrolls[$(this).attr("name")] = $(this).val();
  });
  temp.trolls = JSON.stringify(tempTrolls);
  for (var key in temp) {
    localStorage[key] = temp[key];
  }
  alert(SAVED_SUCCESS_MESSAGE);
  window.close();
  return false;
}

$(document).ready(function() {
  $.ajax({
    url: GET_URL,
    dataType: "json",
    success: function(data) {
      trollList = data;
      load();
      $troll.bind("keydown", function(e) {
        if (e.which === ENTER_KEY) {
          addTroll();
        }
      });
    },
    error: function() {
      trollList = {};
      load();
      $troll.bind("keydown", function(e) {
        if (e.which === ENTER_KEY) {
          addTroll();
        }
      });
    }
  });
});