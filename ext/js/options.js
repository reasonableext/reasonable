(function() {
  var $add, $save, $troll, ENTER_KEY, SAVED_SUCCESS_MESSAGE, addTroll, attachClickEvents, bg, buildControll, buildTroll, load, save, sortTrolls;
  ENTER_KEY = 13;
  SAVED_SUCCESS_MESSAGE = "Saved successfully!\n\nReload any open reason.com pages to reflect any changes you've made.";
  $save = $("#save");
  $add = $("#add");
  $troll = $("#troll");
  bg = chrome.extension.getBackgroundPage();
  sortTrolls = function(trolls) {
    var auto, black, index, key, sortFunction, temp, value, white;
    sortFunction = function(x, y) {
      var a, b;
      a = x.toUpperCase();
      b = y.toUpperCase();
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    };
    black = [];
    white = [];
    auto = [];
    temp = {};
    for (key in trolls) {
      value = trolls[key];
      switch (value) {
        case actions.black.value:
          black.push(key);
          break;
        case actions.white.value:
          white.push(key);
          break;
        case actions.auto.value:
          auto.push(key);
      }
    }
    black.sort(sortFunction);
    white.sort(sortFunction);
    auto.sort(sortFunction);
    for (index in black) {
      value = black[index];
      temp[value] = actions.black.value;
    }
    for (index in white) {
      value = white[index];
      temp[value] = actions.white.value;
    }
    for (index in auto) {
      value = auto[index];
      temp[value] = actions.auto.value;
    }
    localStorage.trolls = JSON.stringify(temp);
    return temp;
  };
  buildControll = function($td, key, value, comp) {
    return $td.append(("<input id='" + key + "_" + comp.value + "' type='radio' name='" + key + "'" + (value === comp.value ? " checked" : void 0) + " value='" + comp.value + "'>") + ("<label for='" + key + "_" + comp.value + "' class='actions'>" + comp.label + "</label>"));
  };
  buildTroll = function(key, value) {
    var $td, $trollConstructor;
    $trollConstructor = $("<tr><td class='name'>" + key + "</td></tr>");
    $td = $('<td class="actions"></td>');
    $td = buildControll($td, key, value, actions.black);
    $td = buildControll($td, key, value, actions.white);
    $td = buildControll($td, key, value, actions.auto);
    $td = $td.append($('<button class="remove">X</button>').click(function() {
      return $(this).closest("tr").remove();
    }));
    return $trollConstructor.append($td);
  };
  addTroll = function() {
    $("#trolls tbody").append(buildTroll($troll.val(), actions.black.value));
    $troll.val(null);
    return false;
  };
  load = function() {
    var $option, key, tKey, tValue, trolls, value;
    for (key in localStorage) {
      value = JSON.parse(localStorage[key]);
      $option = $("#" + key);
      switch ($option.attr("id")) {
        case "trolls":
          trolls = sortTrolls(value);
          break;
        case "name":
          $option.val(value != null ? value : "");
          break;
        default:
          $option.prop("checked", value);
      }
    }
    for (tKey in trolls) {
      tValue = trolls[tKey];
      $("#trolls").append(buildTroll(tKey, tValue));
    }
    if (window.location.hash === "#popup") {
      return $(".scrollContent").fitToWindow(400);
    } else {
      return $(".scrollContent").fitToWindow().keepFitToWindow();
    }
  };
  save = function() {
    var $checkbox, checkbox, radio, textbox, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    _ref = $("#options input:checkbox");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      checkbox = _ref[_i];
      $checkbox = $(checkbox);
      localStorage[$checkbox.attr("id")] = JSON.stringify($checkbox.prop("checked"));
    }
    _ref2 = $("#options input:text");
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      textbox = _ref2[_j];
      localStorage[textbox.id] = JSON.stringify(textbox.value);
    }
    _ref3 = $("input:radio:checked");
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      radio = _ref3[_k];
      localStorage.trolls[radio.name] = radio.value;
    }
    bg.parseSettings();
    alert(SAVED_SUCCESS_MESSAGE);
    window.close();
    return false;
  };
  attachClickEvents = function() {
    $save.click(save);
    return $add.click(addTroll);
  };
  $(function() {
    load();
    $troll.bind("keydown", function(event) {
      if (event.which === ENTER_KEY) return addTroll();
    });
    return attachClickEvents();
  });
}).call(this);
