(function() {
  var comments, getDate, getPermalink, gravatars, historyAndHighlight, showActivity, showMedia, viewThread;
  comments = [];
  getDate = function(node) {
    var match;
    match = COMMENT_DATE_REGEX.exec(node.nodeValue);
    if (match) {
      return createFromET("20" + match[3], parseInt(match[1]), match[2], parseInt(match[4]) % 12 + (match[6] === "PM" ? 12 : 0), match[5]);
    } else {
      return null;
    }
  };
  getPermalink = function($node) {
    return $node.attr("href");
  };
  showMedia = function() {
    if (settings.showPictures || settings.showYouTube) {
      $("div.com-block p a").each(function() {
        var $img, $this, $youtube, matches;
        $this = $(this);
        if (settings.showPictures) {
          if (PICTURE_REGEX.test($this.attr("href"))) {
            $img = $("<img>").addClass("ableCommentPic").attr("src", $this.attr("href"));
            $this.parent().after($img);
          }
        }
        if (settings.showYouTube) {
          matches = YOUTUBE_REGEX.exec($this.attr("href"));
          if (matches != null) {
            $youtube = $("<iframe>").addClass("youtube-player").attr({
              title: "YouTube video player",
              type: "text/html",
              width: "480",
              height: "390",
              src: "http://www.youtube.com/embed/" + matches[1],
              frameborder: "0"
            });
            return $this.parent().after($youtube);
          }
        }
      });
      return $("div.com-block p:not(:has(a)):contains(http)").each(function() {
        var $img, $this;
        $this = $(this);
        if (settings.showPictures) {
          if (PICTURE_REGEX.test($this.text())) {
            $img = $("<img>").addClass("ableCommentPic").attr("src", $this.text());
            return $this.after($img);
          }
        }
      });
    }
  };
  viewThread = function() {
    var showAll, showDirects;
    showDirects = function() {
      var $comment, curScroll, depth, hideHeight, iter;
      curScroll = $(window).scrollTop();
      hideHeight = 0;
      iter = 0;
      $comment = $(this).parent().parent();
      depth = parseInt($comment.attr("class").replace(" troll", "").substr(-1));
      $comment.addClass("ableHighlight").find(".ableShow").text(UNCOLLAPSE);
      while (depth > 0 && iter <= 100) {
        $comment = $comment.prev();
        if (parseInt($comment.attr("class").replace(" troll", "").substr(-1)) === depth - 1) {
          $comment.addClass("ableHighlight").find(".ableShow").text(UNCOLLAPSE);
          depth--;
        } else {
          hideHeight += $comment.height();
          $comment.data("height", $comment.height()).slideUp();
        }
        iter++;
      }
      return $("html, body").animate({
        scrollTop: "" + (curScroll - hideHeight) + "px"
      });
    };
    showAll = function() {
      var $hidden, showHeight;
      showHeight = 0;
      $hidden = $(this).parent().parent().siblings(":hidden");
      $hidden.each(function() {
        var $this;
        $this = $(this);
        $this.slideDown();
        return showHeight += $this.data("height");
      });
      $(".ableHighlight").removeClass("ableHighlight").find(".ableShow").text(COLLAPSE);
      return $("html, body").animate({
        scrollTop: "" + ($(window).scrollTop() + showHeight) + "px"
      });
    };
    $("h2.commentheader:not(:has(a.ignore))").each(function() {
      var $header, $ignore, $pipe, $show, $strong, date, link, name, permalink;
      $header = $(this);
      $strong = $header.children("strong:first");
      name = getName($strong);
      link = getLink($strong);
      date = getDate($header.contents()[DATE_INDEX]);
      permalink = getPermalink($header.children("a.permalink"));
      comments.push({
        name: name,
        link: link,
        date: date,
        permalink: permalink
      });
      $pipe = $("<span>").addClass("pipe").text("|");
      $show = $("<a>").addClass("ableShow").click(function(event) {
        if ($(this).parent().parent().hasClass("ableHighlight")) {
          return showAll.call(this);
        } else {
          return showDirects.call(this);
        }
      }).text(COLLAPSE);
      $ignore = $("<a>").addClass("ignore").data("name", name).data("link", link).click(function(event) {
        var $this;
        $this = $(this);
        $strong = $this.siblings("strong:first");
        name = $this.data("name");
        link = $this.data("link");
        if ($this.text() === IGNORE) {
          return chrome.extension.sendRequest({
            type: "addTroll",
            name: name,
            link: link
          }, function(response) {
            if (response.success) {
              settings.trolls[name] = actions.black.value;
              if (link) {
                settings.trolls[link] = actions.black.value;
              }
              return blockTrolls(true);
            } else {
              return alert("Adding troll failed! Try doing it manually in the options page for now. :(");
            }
          });
        } else {
          return chrome.extension.sendRequest({
            type: "removeTroll",
            name: name,
            link: link
          }, function(response) {
            if (response.success) {
              delete settings.trolls[name];
              delete settings.trolls[link];
              return blockTrolls(true);
            } else {
              return alert("Removing troll failed! Try doing it manually in the options page for now. :(");
            }
          });
        }
      }).text(IGNORE);
      return $(this).append($pipe).append($show).append($pipe.clone()).append($ignore);
    });
    return comments.sort(function(a, b) {
      return a.date < b.date;
    });
  };
  showActivity = function() {
    var activity, comment, commentCount, currentDate, cutoff, descByDate, html, i, index, latestComments, withinCutoff, _i, _len, _len2, _ref;
    if (settings.showActivity) {
      commentCount = 0;
      activity = [0, 0, 0, 0, 0];
      latestComments = "";
      descByDate = function(a, b) {
        if (a.date > b.date) {
          return -1;
        } else if (a.date < b.date) {
          return 1;
        } else {
          return 0;
        }
      };
      currentDate = new Date();
      comments.sort(descByDate);
      for (_i = 0, _len = comments.length; _i < _len; _i++) {
        comment = comments[_i];
        if (commentCount < LATEST_COMMENT_COUNT) {
          commentCount++;
          latestComments += "<li><a href='" + comment.permalink + "'>" + comment.name + "</a></li>";
        }
        withinCutoff = false;
        for (index = 0, _len2 = ACTIVITY_CUTOFFS.length; index < _len2; index++) {
          cutoff = ACTIVITY_CUTOFFS[index];
          if (currentDate - comment.date <= cutoff) {
            for (i = index, _ref = ACTIVITY_CUTOFFS.length; index <= _ref ? i <= _ref : i >= _ref; index <= _ref ? i++ : i--) {
              activity[i]++;
            }
            withinCutoff = true;
            break;
          }
        }
        if (!(withinCutoff || commentCount < LATEST_COMMENT_COUNT)) {
          break;
        }
      }
      html = "<div id='ableActivity' class='ableBox'>\n  <h3>Thread Activity</h3>\n  <ul>\n    <li>\n      <h4>Most recent " + commentCount + " post" + (commentCount === 1 ? "" : "s") + "</h4>\n      <ul>\n        " + latestComments + "\n      </ul>\n    </li>\n    <li>\n      <h4>Post frequency</h4>\n      <table>\n        <tr><th>Last 5 min</th><td>" + activity[0] + "</td></tr>\n        <tr><th>Last 15 min</th><td>" + activity[1] + "</td></tr>\n        <tr><th>Last 30 min</th><td>" + activity[2] + "</td></tr>\n        <tr><th>Last 1 hour</th><td>" + activity[3] + "</td></tr>\n        <tr><th>Last 2 hours</th><td>" + activity[4] + "</td></tr>\n      </ul>\n    </li>\n  </ul>\n</div>";
      return $("body").append(html);
    }
  };
  gravatars = function() {
    if (settings.showGravatar) {
      return $(".commentheader > strong").each(function() {
        var $img, $link, $this, hash;
        $this = $(this);
        $link = $("a", $this);
        hash = "";
        if ($this.text() === "Amakudari") {
          hash = MY_MD5;
        } else if ($link.size() === 0) {
          hash = md5($this.text());
        } else if ($link.attr("href").indexOf("mailto:") > -1) {
          hash = md5($link.attr("href").replace("mailto:", ""));
        } else {
          hash = md5($link.attr("href"));
        }
        $img = $("<img>").addClass("ableGravatar").attr("src", AVATAR_PREFIX + hash + AVATAR_SUFFIX);
        return $this.closest("div").prepend($img);
      });
    }
  };
  historyAndHighlight = function() {
    var $header, header, permalink, temp, urlMatches, _i, _len, _ref;
    if (settings.keepHistory || settings.highlightMe) {
      permalink = 0;
      if ((settings.name != null) && settings.name !== "") {
        _ref = $("h2.commentheader > strong:contains('" + settings.name + "') ~ a.permalink");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          header = _ref[_i];
          $header = $(header);
          if (settings.keepHistory) {
            temp = parseFloat($header.attr("href").replace("#comment_", ""));
            if (temp > permalink) {
              permalink = temp;
            }
          }
          if (settings.highlightMe) {
            $header.closest("div").addClass("ableMe");
          }
        }
      }
      if (settings.keepHistory) {
        if (permalink === 0) {
          return buildQuickload();
        } else {
          urlMatches = ARTICLE_REGEX.exec(window.location.href);
          return chrome.extension.sendRequest({
            type: "keepHistory",
            url: urlMatches[1],
            permalink: permalink
          }, function(response) {
            if (!response.exists) {
              settings.history.unshift({
                timestamp: response.timestamp,
                url: urlMatches[1],
                permalink: permalink
              });
            }
            return buildQuickload();
          });
        }
      }
    }
  };
}).call(this);
