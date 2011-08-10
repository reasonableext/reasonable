(function() {
  var ACTIVITY_CUTOFFS, ARTICLE_REGEX, ARTICLE_SHORTEN_REGEX, AVATAR_PREFIX, AVATAR_SUFFIX, COLLAPSE, COMMENT_DATE_REGEX, COMMENT_HISTORY, DATE_INDEX, ESCAPE_KEY, EST_OFFSET, FADE_SPEED, FIRST_MATCH, IGNORE, LATEST_COMMENT_COUNT, LIGHTS_OUT_OPACITY, MINIMAL_FADE_SPEED, MINIMAL_OPACITY, MS_PER_HOUR, MY_MD5, PICTURE_REGEX, QUICKLOAD_MAX_ITEMS, QUICKLOAD_SPEED, TOTAL_OPACITY, UNCOLLAPSE, UNIGNORE, UPDATE_POST_TIMEOUT_LENGTH, URL_REGEX, YOUTUBE_REGEX, altText, blockTrolls, buildQuickInsert, buildQuickload, commentOnlyRoutines, comments, createFromET, createUTC, defaultSettings, dstStartEnd, dstTest, formatDate, getDate, getLink, getName, getPermalink, getSettings, gravatars, historyAndHighlight, lightsOn, lightsOut, months, quickInsert, removeGooglePlus, settings, showActivity, showImagePopup, showMedia, trolls, updatePosts, viewThread;
  QUICKLOAD_MAX_ITEMS = 20;
  URL_REGEX = /^https?:\/\/(www\.)?([^\/]+)?/i;
  PICTURE_REGEX = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png|bmp))(?:\?([^#]*))?(?:#(.*))?/i;
  YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)(?:\#t\=[0-9]{2}m[0-9]{2}s)?/i;
  ARTICLE_REGEX = /reason\.com\/(.*?)(?:\#comment)?s?(?:\_[0-9]{6,7})?$/;
  ARTICLE_SHORTEN_REGEX = /^(?:archives|blog)?\/(?:19|20)[0-9]{2}\/(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[0-1])\/(.*?)(?:\#|$)/;
  COLLAPSE = "show direct";
  UNCOLLAPSE = "show all";
  IGNORE = "ignore";
  UNIGNORE = "unignore";
  DATE_INDEX = 2;
  COMMENT_DATE_REGEX = /(1[0-2]|[1-9])\.(3[0-1]|[1-2][0-9]|[1-9])\.([0-9]{2})\s@\s(1[0-2]|[1-9])\:([0-5][0-9])([AP]M)/;
  ACTIVITY_CUTOFFS = [300000, 900000, 1800000, 3600000, 7200000];
  LATEST_COMMENT_COUNT = 5;
  AVATAR_PREFIX = "http://www.gravatar.com/avatar/";
  AVATAR_SUFFIX = "?s=40&d=identicon";
  MY_MD5 = "b5ce5f2f748ceefff8b6a5531d865a27";
  LIGHTS_OUT_OPACITY = 0.5;
  MINIMAL_OPACITY = 0.01;
  TOTAL_OPACITY = 1;
  FADE_SPEED = 500;
  MINIMAL_FADE_SPEED = 5;
  COMMENT_HISTORY = "Comment History";
  ESCAPE_KEY = 27;
  FIRST_MATCH = 1;
  QUICKLOAD_SPEED = 100;
  UPDATE_POST_TIMEOUT_LENGTH = 60000;
  defaultSettings = {
    name: null,
    history: [],
    hideAuto: true,
    shareTrolls: true,
    showAltText: true,
    showActivity: true,
    showUnignore: true,
    showPictures: true,
    showQuickInsert: true,
    showYouTube: true,
    keepHistory: true,
    highlightMe: true,
    showGravatar: false,
    blockIframes: false,
    name: ""
  };
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  settings = {};
  trolls = [];
  lightsOn = false;
  MS_PER_HOUR = 60 * 60 * 1000;
  EST_OFFSET = -5;
  createUTC = function(year, month, day, hour, minute, second, millisecond) {
    var utc;
    if (hour == null) {
      hour = 0;
    }
    if (minute == null) {
      minute = 0;
    }
    if (second == null) {
      second = 0;
    }
    if (millisecond == null) {
      millisecond = 0;
    }
    utc = new Date();
    utc.setUTCFullYear(year);
    utc.setUTCMonth(month - 1);
    utc.setUTCDate(day);
    utc.setUTCHours(hour);
    utc.setUTCMinutes(minute);
    utc.setUTCSeconds(second);
    utc.setUTCMilliseconds(millisecond);
    return utc;
  };
  dstStartEnd = function(year, offset) {
    var march, marchDay, november, novemberDay;
    if (offset == null) {
      offset = 0;
    }
    march = createUTC(year, 3, 1, 7 + offset);
    november = createUTC(year, 11, 1, 6 + offset);
    marchDay = march.getUTCDay();
    novemberDay = november.getUTCDay();
    if (marchDay === 0) {
      marchDay = 7;
    }
    if (novemberDay === 0) {
      novemberDay = 7;
    }
    march.setUTCDate(marchDay);
    november.setUTCDate(novemberDay);
    return {
      start: march,
      end: november
    };
  };
  dstTest = function(date, offset) {
    var startEnd;
    if (offset == null) {
      offset = 0;
    }
    startEnd = dstStartEnd(date.getUTCFullYear(), offset);
    return date >= startEnd.start && date <= startEnd.end;
  };
  createFromET = function(year, month, day, hour, minute, second, millisecond) {
    var utc;
    if (hour == null) {
      hour = 0;
    }
    if (minute == null) {
      minute = 0;
    }
    if (second == null) {
      second = 0;
    }
    if (millisecond == null) {
      millisecond = 0;
    }
    utc = createUTC(year, month, day, hour, minute, second, millisecond);
    utc.setUTCHours(utc.getUTCHours() - EST_OFFSET - (dstTest(utc, EST_OFFSET) ? 1 : 0));
    return utc;
  };
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
  showImagePopup = function(img) {
    var $box, $img, $win;
    $win = $(window);
    $box = $("div#ableLightsOutBox");
    return $img = $("<img>").load(function() {
      var $this;
      $this = $(this);
      $("div#ableLightsOut").css("height", $(document).height()).fadeTo(FADE_SPEED, LIGHTS_OUT_OPACITY);
      $box.empty().append($img).fadeTo(MINIMAL_FADE_SPEED, MINIMAL_OPACITY, function() {
        return $(this).center().fadeTo(FADE_SPEED - MINIMAL_FADE_SPEED, TOTAL_OPACITY);
      }).fadeTo(FADE_SPEED, TOTAL_OPACITY);
      return lightsOn = true;
    }).attr("src", $(img).attr("src"));
  };
  altText = function() {
    if (settings.showAltText) {
      return $("div.post img[alt]").each(function() {
        var $div, $img;
        $img = $("<img>").attr("src", this.src).click(function() {
          return showImagePopup(this);
        });
        $div = $("<div>").addClass("ablePic").append($img).append(this.alt);
        return $(this).replaceWith($div);
      });
    }
  };
  lightsOut = function() {
    var $box, $overlay, turnLightsOn;
    $overlay = $("<div>").attr("id", "ableLightsOut").css("height", $(document).height());
    $box = $("<div>").attr("id", "ableLightsOutBox").keepCentered();
    turnLightsOn = function() {
      lightsOn = false;
      $overlay.fadeOut();
      return $box.fadeOut();
    };
    $("body").append($box.click(turnLightsOn)).append($overlay.click(turnLightsOn));
    return $(window).keydown(function(event) {
      if (lightsOn && event.which === ESCAPE_KEY) {
        return turnLightsOn();
      }
    });
  };
  removeGooglePlus = function() {
    if (settings.blockIframes) {
      return $("li.google").remove();
    }
  };
  quickInsert = function(tag, attrs, $textarea) {
    var endPos, endTag, endText, midText, startPos, startTag, startText, text, textarea;
    textarea = $textarea[0];
    text = $textarea.val();
    startPos = textarea.selectionStart;
    endPos = textarea.selectionEnd;
    startText = text.substr(0, startPos);
    midText = text.substr(startPos, endPos - startPos);
    endText = text.substr(endPos);
    startTag = "<" + tag;
    endTag = "</" + tag + ">";
    if (attrs != null) {
      $.each(attrs, function(name, attr) {
        return startTag += " " + attr + "=\"" + (prompt("Enter " + name + ":")) + "\"";
      });
    }
    startTag += ">";
    $textarea.val(startText + startTag + midText + endTag + endText).focus();
    textarea.selectionStart = startPos + startTag.length;
    textarea.selectionEnd = endPos + startTag.length;
    return false;
  };
  buildQuickInsert = function() {
    var buildToolbar;
    if (settings.showQuickInsert) {
      buildToolbar = function($textarea) {
        return $textarea.before($("<div>").addClass("ableInsert").append($("<a>").attr("href", "#").text("link").click(function() {
          return quickInsert("a", {
            URL: "href"
          }, $textarea);
        })).append($("<span>").addClass("pipe").text(" | ")).append($("<a>").attr("href", "#").text("quote").click(function() {
          return quickInsert("blockquote", null, $textarea);
        })).append($("<span>").addClass("pipe").text(" | ")).append($("<a>").attr("href", "#").text("bold").click(function() {
          return quickInsert("b", null, $textarea);
        })).append($("<span>").addClass("pipe").text(" | ")).append($("<a>").attr("href", "#").text("italic").click(function() {
          return quickInsert("i", null, $textarea);
        })).append($("<span>").addClass("pipe").text(" | ")).append($("<a>").attr("href", "#").text("strike").click(function() {
          return quickInsert("s", null, $textarea);
        })));
      };
      $("textarea").each(function() {
        return buildToolbar($(this));
      });
      return $(".comment_reply.submit").click(function() {
        return buildToolbar($(this).parent().next(".leave-comment.reply").find("textarea"));
      });
    }
  };
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
  updatePosts = function() {
    if (settings.updatePosts) {
      $.ajax({
        url: window.location.href,
        success: function(data) {
          var $container, $prevNode, idRe, ids, match, re, updateLinks;
          re = /<div class=\"com-block[\s\S]*?<\/div>[\s\S]*?<\/div>/gim;
          idRe = /id=\"(comment_[0-9].*?)\"/;
          match = re.exec(data);
          comments = [];
          $curNode;
          $prevNode = null;
          $container = $("#commentcontainer");
          updateLinks = false;
          while (match != null) {
            ids = idRe.exec(match);
            comments.push({
              html: match,
              id: ids[1]
            });
            match = re.exec(data);
          }
          $.each(comments, function() {
            var $curNode, html;
            html = this.html.toString().replace(/\/\/[\s\S]*?\]\]>/, "temp");
            $curNode = $("#" + this.id);
            if ($curNode.size() === 0) {
              updateLinks = true;
              if ($prevNode != null) {
                $prevNode.after(html);
                return $prevNode = $prevNode.next();
              } else {
                $container.append(html);
                return $prevNode = $container.children("div:first");
              }
            } else {
              return $prevNode = $curNode;
            }
          });
          viewThread();
          return blockTrolls(false);
        }
      });
      return setTimeout(updatePosts, UPDATE_POST_TIMEOUT_LENGTH);
    }
  };
  getSettings = function(response, defaults) {
    var arr, key, reset, temp, value, _ref;
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
