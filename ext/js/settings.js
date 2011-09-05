(function() {
  var key, tKey, tValue, temp, value, _ref, _ref2;
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
    switch (key) {
      case "trolls":
        _ref2 = temp.trolls;
        for (tKey in _ref2) {
          tValue = _ref2[tKey];
          if (!(tValue === actions.black.value || (temp.hideAuto && tValue === actions.auto.value))) {
            delete temp.trolls[tKey];
          }
        }
        break;
      case "history":
        try {
          temp.history = JSON.parse(temp.history).sort(function(a, b) {
            return a.permalink - b.permalink;
          });
        } catch (error) {
          temp.history = [];
        }
    }
  }
  window.settings = temp;
}).call(this);
