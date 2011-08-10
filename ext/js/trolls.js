(function() {
  var blockTrolls, getLink, getName;
  getName = function($strong) {
    var temp;
    if ($strong.children("a").size() > 0) {
      temp = $strong.children("a").text();
    } else {
      temp = $strong.text();
    }
    return temp = temp.replace(/^\s|\s$/g, "");
  };
  getLink = function($strong) {
    var match, temp;
    if ($strong.children("a").size() > 0) {
      temp = $("a", $strong).attr("href");
      match = temp.match(URL_REGEX);
      if (match) {
        temp = JSON.stringify(match[2]);
      } else {
        temp = temp.replace("mailto:", "");
      }
      return temp = temp.replace(/"/g, "");
    } else {
      return "";
    }
  };
  blockTrolls = function(smoothTransitions) {
    var showHeight;
    showHeight = 0;
    return $("h2.commentheader strong").each(function() {
      var $body, $ignore, $this, link, name;
      $this = $(this);
      $ignore = $this.siblings("a.ignore");
      name = $ignore.data("name");
      link = $ignore.data("link");
      if ((settings.trolls[name] != null) || (link !== "" && (settings.trolls[link] != null))) {
        $body = $this.html(name).siblings("a.ignore").text(UNIGNORE).closest("div").addClass("troll").children("p, blockquote, img, iframe");
        if (!settings.showUnignore) {
          $this.siblings("a.ignore").hide().prev("span.pipe").hide();
        }
        if (smoothTransitions) {
          $body.slideUp();
        } else {
          $body.hide();
        }
      } else if (smoothTransitions && $ignore.text() === UNIGNORE) {
        $this.siblings("a.ignore").text(IGNORE).closest("div").removeClass("troll").children("p, blockquote").slideDown();
      }
      return true;
    });
  };
}).call(this);
