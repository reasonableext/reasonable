(function() {
  var ACTIVITY_CUTOFFS, ARTICLE_REGEX, ARTICLE_SHORTEN_REGEX, AVATAR_PREFIX, AVATAR_SUFFIX, COLLAPSE, COMMENT_DATE_REGEX, COMMENT_HISTORY, ESCAPE_KEY, FADE_SPEED, FIRST_MATCH, IGNORE, LIGHTS_OUT_OPACITY, MINIMAL_FADE_SPEED, MINIMAL_OPACITY, MY_MD5, PICTURE_REGEX, QUICKLOAD_MAX_ITEMS, QUICKLOAD_SPEED, TOTAL_OPACITY, UNCOLLAPSE, UNIGNORE, UPDATE_POST_TIMEOUT_LENGTH, URL_REGEX, YOUTUBE_REGEX, altText, blockTrolls, buildQuickInsert, buildQuickload, commentOnlyRoutines, defaultSettings, formatDate, getLink, getName, getSettings, gravatars, historyAndHighlight, lightsOn, lightsOut, months, quickInsert, removeGooglePlus, settings, showActivity, showImagePopup, showMedia, trolls, updatePosts, viewThread;
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
  COMMENT_DATE_REGEX = /(1[0-2]|[1-9])\.(3[0-1]|[1-2][0-9]|[1-9])\.([0-9]{2})\s@\s(1[0-2]|[1-9])\:([0-5][0-9])([AP]M)/g;
  ACTIVITY_CUTOFFS = [1800000, 3600000, 14400000, 43200000, 86400000];
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
    updatePosts: false,
    name: ""
  };
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  settings = {};
  trolls = [];
  lightsOn = false;
  getName = function($strong) {
    var temp;
    if ($strong.children("a").size > 0) {
      temp = $("a", $strong).text();
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
        if (parseInt($comment.attr("class").replace(" troll", "").substr(-1 === depth - 1))) {
          $comment.addClass("ableHightlight").find(".ableShow").text(UNCOLLAPSE);
          depth--;
        } else {
          hideHeight += $comment.height();
          $comment.data("height", $comment.height()).slideUp();
        }
        iter++;
      }
      return $("html, body").animate({
        scrollTop: "" + (curScroll - hideHeight) + " px"
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
        scrollTop: "" + ($(window).scrollTop() + showHeight) + " px"
      });
    };
    return $("h2.commentheader:not(:has(a.ignore))").each(function() {
      var $ignore, $pipe, $show, $strong, link, name;
      $strong = $("strong:first", this);
      name = getName($strong);
      link = getLink($strong);
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
  };
  showActivity = function() {
    var activity, commentHTML, cutoff, date, dates, html, i, index, lastDate, lastDateAmPm, lastDateHours, lastDateMinutes, lastDateText, match, _i, _len, _len2;
    if (settings.showActivity) {
      commentHTML = $("#commentcontainer").html();
      i = 0;
      dates = [];
      activity = [0, 0, 0, 0, 0];
      while (match = COMMENT_DATE_REGEX.exec(commentHTML)) {
        dates.push(new Date("20" + match[3], parseInt(match[1]) - 1, match[2], parseInt(match[4]) % 12 + (match[6] === "PM" ? 12 : 0), match[5]));
      }
      dates.sort();
      lastDate = dates[dates.length - 1];
      lastDateHours = lastDate.getHours();
      lastDateAmPm = "a";
      if (lastDateHours >= 12) {
        lastDateHours -= 12;
        lastDateAmPm = "p";
      }
      if (lastDateHours === 0) {
        lastDateHours += 12;
      }
      lastDateMinutes = lastDate.getMinutes();
      if (lastDateMinutes < 10) {
        lastDateMinutes = "0" + lastDateMinutes;
      }
      lastDateText = "" + (lastDate.getMonth() + 1) + "/" + (lastDate.getDate()) + "/" + (lastDate.getFullYear()) + "                    " + lastDateHours + ":" + lastDateMinutes + lastDateAmPm;
      for (_i = 0, _len = dates.length; _i < _len; _i++) {
        date = dates[_i];
        for (index = 0, _len2 = ACTIVITY_CUTOFFS.length; index < _len2; index++) {
          cutoff = ACTIVITY_CUTOFFS[index];
          if (lastDate - date <= cutoff) {
            activity[index]++;
            break;
          }
        }
      }
      html = "<div id='ableActivity'>\n  <ul id='ableActivity'>\n    <li>Latest post: " + lastDateText + "</li>\n    <li>30 min prior: " + activity[0] + "</li>\n    <li>1 hour prior: " + activity[1] + "</li>\n    <li>4 hours prior: " + activity[2] + "</li>\n    <li>12 hours prior: " + activity[3] + "</li>\n    <li>1 day prior: " + activity[4] + "</li>\n  </ul>\n</div>";
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
              $ul = $ul.prepend("<li>\n  <h2>" + date + "</h2>\n  <ul></ul>\n</li>");
            }
            $ul = $("li:first ul", $ul).prepend("<li>\n  <a href=\"http://reason.com/" + value.url + "#comment_" + value.permalink + "\">\n    " + shortenMatch + " (" + value.permalink + ")\n  </a>\n</li>").parent().parent();
          }
        }
        $quickload = $("<div id=\"ableQuick\"><h3>" + COMMENT_HISTORY + "</h3></div>").append($ul).hover((function() {
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
          var $container, $prevNode, comments, idRe, ids, match, re, updateLinks;
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
