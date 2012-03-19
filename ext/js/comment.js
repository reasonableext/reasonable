var Comment;

Comment = (function() {
  var extract_date;

  function Comment(node) {
    var header, p;
    this.id = parseInt(node.id.replace("comment_", ""));
    header = node.getElementsByTagName("h2")[0];
    console.log(this.id);
    this.content = ((function() {
      var _i, _len, _ref, _results;
      _ref = node.getElementsByTagName("p");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        _results.push(p.textContent);
      }
      return _results;
    })()).join("\n");
    this.timestamp = extract_date(header.textContent);
    this.depth = parseInt(node.className.substr(-1));
  }

  extract_date = function(text) {
    var ampm, day, hours, matches, minutes, month, year, _;
    matches = text.match(/(\d+)\.(\d+)\.(\d+) \@ (\d+):(\d+)(AM|PM)/);
    _ = matches[0], month = matches[1], day = matches[2], year = matches[3], hours = matches[4], minutes = matches[5], ampm = matches[6];
    year = parseInt(year) + 2000;
    month = parseInt(month) - 1;
    hours = parseInt(hours) + 5;
    if (ampm === "PM") hours += 12;
    return new Date(Date.UTC(year, month, day, hours, minutes, 0));
  };

  return Comment;

})();
