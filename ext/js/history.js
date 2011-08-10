(function() {
  var buildQuickload, formatDate;
  formatDate = function(milliseconds) {
    var date;
    date = new Date(milliseconds);
    return "" + months[date.getMonth()] + " " + (date.getDate()) + ", " + (date.getFullYear());
  };
  buildQuickload = function() {
    var $quickload, $ul, count, date, shortenMatch, temp, value, _i, _len, _ref;
    if ($("#ableQuick").size() === 0) {
      if (settings.history.length > 0) {
        $ul = $("<ul>");
        date = "";
        count = 0;
        _ref = settings.history;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          value = _ref[_i];
          if (count++ <= QUICKLOAD_MAX_ITEMS) {
            shortenMatch = ARTICLE_SHORTEN_REGEX.exec(value.url)[FIRST_MATCH];
            temp = formatDate(value.timestamp);
            if (temp !== date) {
              date = temp;
              $ul = $ul.prepend("<li>\n  <h4>" + date + "</h4>\n  <ul></ul>\n</li>");
            }
            $ul = $("li:first ul", $ul).prepend("<li>\n  <a href=\"http://reason.com/" + value.url + "#comment_" + value.permalink + "\">\n    " + shortenMatch + " (" + value.permalink + ")\n  </a>\n</li>").parent().parent();
          }
        }
        $quickload = $("<div id='ableQuick' class='ableBox'><h3>" + COMMENT_HISTORY + "</h3></div>").append($ul).hover((function() {
          return $ul.slideDown(QUICKLOAD_SPEED);
        }), (function() {
          return $ul.slideUp(QUICKLOAD_SPEED);
        }));
        return $("body").append($quickload);
      }
    }
  };
}).call(this);
