// Copyright 2011 Bryan McKelvey

// Get domain name from URL
var URL_REGEX = /^https?:\/\/(www\.)?([^\/]+)?/i;

// Picture regex is based on RFC 2396. It doesn't require a prefix and allows ? and # suffixes.
var PICTURE_REGEX = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png|bmp))(?:\?([^#]*))?(?:#(.*))?/i;

// Pretty strict filter. May want to revise for linking to someone's profile page.
var YOUTUBE_REGEX = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9-_]+)(?:\#t\=[0-9]{2}m[0-9]{2}s)?/i;

// Article URL regular expressions
const ARTICLE_REGEX = /reason\.com\/(.*?)(?:\#comment)?s?(?:\_[0-9]{6,7})?$/;
const ARTICLE_SHORTEN_REGEX = /^(?:archives|blog)?\/(?:19|20)[0-9]{2}\/(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[0-1])\/(.*?)(?:\#|$)/;

// Post labels
const COLLAPSE = "show direct";
const UNCOLLAPSE = "show all";
const IGNORE = "ignore";
const UNIGNORE = "unignore";

// Avatars
const AVATAR_PREFIX = "http://www.gravatar.com/avatar/";
const AVATAR_SUFFIX = "?s=40&d=identicon";
const MY_MD5 = "b5ce5f2f748ceefff8b6a5531d865a27";

// Lights out
const LIGHTS_OUT_OPACITY = 0.5;
const MINIMAL_OPACITY = 0.01;
const TOTAL_OPACITY = 1;
const FADE_SPEED = 500;
const MINIMAL_FADE_SPEED = 5;

// Others and magic number avoidance
const COMMENT_HISTORY = "Comment History";
const ESCAPE_KEY = 27;
const FIRST_MATCH = 1;
const QUICKLOAD_SPEED = 100;
const UPDATE_POST_TIMEOUT_LENGTH = 60000;

// Can't be set as constants, but should not be modified
var defaultSettings = {
  "name": null,
  "history": [],
  "hideAuto": true,
  "shareTrolls": true,
  "showAltText": true,
  "showUnignore": true,
  "showPictures": true,
  "showYouTube": true,
  "keepHistory": true,
  "highlightMe": true,
  "showGravatar": false,
  "blockIframes": false,
  "updatePosts": false,
  "name": ""
};
var months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

var settings;
var trolls = [];
var lightsOn = false;

function getName($strong) {
  var temp;

  // Get name from STRONG tag encapsulating poster's name
  if ($strong.children("a").size() > 0) {
    // Kind of ugly, but necessary to avoid CDATA
    temp = $("a", $strong).text();
  } else {
    temp = $strong.text();
  }
  
  // Strip beginning and ending spaces
  temp = temp.replace(/^\s|\s$/g, "");
  
  return temp;
}

function getLink($strong) {
  if ($strong.children("a").size() > 0) {
    var temp = $("a", $strong).attr("href");

    // For blogwhore filtering, get domain name if link is a URL
    var match = temp.match(URL_REGEX);
    if (match) {
      temp = JSON.stringify(match[2]);
    } else {
      temp = temp.replace("mailto:", "");
    }

    // Replace quotation marks with blank spaces
    temp = temp.replace(/"/g, "");

    return temp;
  } else {
    // Ignore if no link
    return "";
  }
}

function showImagePopup(img) {
  var $window = $(window);
  var $box = $("div#ableLightsOutBox");
  var $img = $("<img>").load(function() {
    var $this = $(this);
    
    // Have to use setTimeout because height and width from the load event are both 0
    // Once we've waited a second after loading, though, it should work and be
    // able to center the image
    $("div#ableLightsOut").css("height", $(document).height()).fadeTo(FADE_SPEED, LIGHTS_OUT_OPACITY);
    $box.empty().append($img).fadeTo(MINIMAL_FADE_SPEED, MINIMAL_OPACITY, function() {
      $(this).center().fadeTo(FADE_SPEED - MINIMAL_FADE_SPEED, TOTAL_OPACITY);
    }).fadeTo(FADE_SPEED, TOTAL_OPACITY);
    lightsOn = true;
  }).attr("src", $(img).attr("src"));
}

function getSettings(response, defaults) {
  var temp;
  var reset = false;

  // Use saved settings if they exist
  try {
    temp = response.settings;
  } catch(e) {
    temp = {};
  }
  
  $.each(defaults, function(key, value) {
    // Check original value from settings
    switch (temp[key]) {
      case undefined:
        // Set to default if undefined
        temp[key] = value;
        reset = true;
        break;
      case "true":
        // See below for case "false", which is affected more
        temp[key] = true;
        break;
      case "false":
        // Prevent boolean true from being stored as text
        // Without this, things like
        // if (settings.updatePosts) { ... }
        // will always evaluate as true and execute
        temp[key] = false;
        break;
      default:
        // Some operations need to be done on the trolls and history settings
        switch (key) {
          case "trolls":
            // Troll list is stored as a string, so parse as JSON first
            var arr = JSON.parse(temp.trolls);
            temp.trolls = {};
            
            // Add trolls from blacklist and, at user's option, from autolist
            $.each(arr, function(trollKey, trollValue) {
              if (trollValue === actions.black.value || (temp.hideAuto && trollValue === actions.auto.value)) {
                temp.trolls[trollKey] = trollValue;
              }
            });
            break;
          case "history":
            try {
              // Sort history by date in descending order
              temp.history = JSON.parse(temp.history).sort(function(a, b) { return (a.permalink - b.permalink); });
            } catch(e) {
              temp = [];
            }
            break;
          default:
            break;
        }
        break;
    }
  });
    
  // Store settings
  settings = temp;

  // Save if anything had to be reset
  if (reset) {
    chrome.extension.sendRequest({type: "reset", settings: temp});
  }
}

function showMedia() {
  if (settings.showPictures || settings.showYouTube) {
    $("div.com-block p a").each(function() {
      var $this = $(this);
      
      // Picture routine
      if (settings.showPictures) {
        if (PICTURE_REGEX.test($this.attr("href"))) {
          var $img = $("<img>").addClass("ableCommentPic").attr("src", $this.attr("href"));
          $this.parent().after($img);
        }
      }
      
      // YouTube routine
      if (settings.showYouTube) {
        var matches = YOUTUBE_REGEX.exec($this.attr("href"));

        if (matches != null) {
          var $youtube = $("<iframe>").addClass("youtube-player").attr({
            title: "YouTube video player",
            type: "text/html",
            width: "480",
            height: "390",
            src: "http://www.youtube.com/embed/" + matches[1],
            frameborder: "0"
          });
          
          $this.parent().after($youtube);
        }
      }
    });
    
    $("div.com-block p:not(:has(a)):contains(http)").each(function() {
      var $this = $(this);
      if (settings.showPictures) {
        if (PICTURE_REGEX.test($this.text())) {
          var $img = $("<img>").addClass("ableCommentPic").attr("src", $this.text());
          $this.after($img);
        }
      }
    });
  }
}

function altText() {
  if (settings.showAltText) {
    // Applies to all images with an alt attribute within an article
    $("div.post img[alt]").each(function() {
      // When clicked, show the image at its fullest visible dimensions
      // against a darkened background
      var $img = $("<img>").attr("src", this.src).click(function() { showImagePopup(this); });

      // Create a DIV containing the image followed by its alt text
      var $div = $("<div>").addClass("ablePic").append($img).append(this.alt);

      // Replace existing image with the above DIV
      $(this).replaceWith($div);
    });
  }
}

function viewThread() {
  // Shows only the direct thread
  var showDirects = function() {
    var curScroll = $(window).scrollTop();
    var hideHeight = 0;
    var iter = 0;
    var $comment = $(this).parent().parent();
    
    // Get last digit for depth, ignoring the added class for trolls
    var depth = parseInt($comment.attr("class").replace(" troll", "").substr(-1));
    $comment.addClass("ableHighlight").find(".ableShow").text(UNCOLLAPSE);
    while (depth > 0 && iter <= 100) {
      $comment = $comment.prev();
      if (parseInt($comment.attr("class").replace(" troll", "").substr(-1)) === depth - 1) {
        $comment.addClass("ableHighlight").find(".ableShow").text(UNCOLLAPSE);
        depth--;
      } else {
        hideHeight += $comment.height();
        
        // You can't get the height of a hidden element, so store height
        // in data attribute for when you want to unhide it later
        $comment.data("height", $comment.height()).slideUp();
      }
      iter++;
    }
    $("html, body").animate({scrollTop: curScroll - hideHeight + "px"});
  };
  
  // Unhides everything
  var showAll = function() {
    var showHeight = 0;
    var $hidden = $(this).parent().parent().siblings(":hidden");
    $hidden.each(function() {
      var $this = $(this);
      $this.slideDown();
      
      // Have to reference data attribute because .height() will return 0
      showHeight += $this.data("height");
    });
    $(".ableHighlight").removeClass("ableHighlight").find(".ableShow").text(COLLAPSE);
    $("html, body").animate({scrollTop: $(window).scrollTop() + showHeight + "px"});
  };

  $("h2.commentheader:not(:has(a.ignore))").each(function() {
    var $strong = $("strong:first", this);
    var name = getName($strong);
    var link = getLink($strong);
    var $pipe = $("<span>").addClass("pipe").text("|");
    var $show = $("<a>").addClass("ableShow").click(function(e) {
      var $this = $(this);
      if ($this.parent().parent().hasClass("ableHighlight")) {
        showAll.call(this);
      } else {
        showDirects.call(this);
      }
    }).text(COLLAPSE);
    var $ignore = $("<a>").addClass("ignore").data("name", name).data("link", link).click(function(e) {
      var $this = $(this);
      var $strong = $this.siblings("strong:first");
      var name = $(this).data("name");
      var link = $(this).data("link");
      
      if ($this.text() === IGNORE) {
        chrome.extension.sendRequest({type: "addTroll", name: name, link: link}, function(response) {
          if (response.success == true) {
            settings.trolls[name] = actions.black.value;
            if (link) {
              settings.trolls[link] = actions.black.value;
            }
            blockTrolls(true);
          } else {
            alert("Adding troll failed! Try doing it manually in the options page for now. :(");
          }
        });
      } else {
        chrome.extension.sendRequest({type: "removeTroll", name: name, link: link}, function(response) {
          if (response.success == true) {
            delete settings.trolls[name];
            delete settings.trolls[link];
            blockTrolls(true);
          } else {
            alert("Removing troll failed! Try doing it manually in the options page for now. :(");
          }
        });
      }
    }).text(IGNORE);
    $(this).append($pipe).append($show).append($pipe.clone()).append($ignore);
  });
}

function updatePosts() {
  if (settings.updatePosts) {
    $.ajax({
      url: window.location.href,
      success: function(data) {
        var re = /<div class=\"com-block[\s\S]*?<\/div>[\s\S]*?<\/div>/gim;
        var idRe = /id=\"(comment_[0-9].*?)\"/
        var match = re.exec(data);
        var comments = [];
        var $curNode;
        var $prevNode = null;
        var $container = $("#commentcontainer");
        var updateLinks = false;

        while (match != null) {
          var ids = idRe.exec(match);
          comments.push({html: match, id: ids[1]});
          match = re.exec(data);
        }
        
        $.each(comments, function() {
          var html = this.html.toString().replace(/\/\/[\s\S]*?\]\]>/, "temp");
          $curNode = $("#" + this.id);
          
          if ($curNode.size() === 0) {
            updateLinks = true;
            if ($prevNode !=  null) {
              $prevNode.after(html);
              $prevNode = $prevNode.next();
            } else {
              $container.append(html);
              $prevNode = $container.children("div:first");
            }
          } else {
           $prevNode = $curNode;
          }
        });
        
        viewThread();
        blockTrolls(false);
      }
    });

    setTimeout(function() { updatePosts(); }, UPDATE_POST_TIMEOUT_LENGTH);
  }
}

function blockTrolls(smoothTransitions) {
  var showHeight = 0;

  $($("h2.commentheader strong")).each(function() {
    var $this = $(this);
    var $ignore = $this.siblings("a.ignore");
    var name = $ignore.data("name");
    var link = $ignore.data("link");

    if (name in settings.trolls || (link !== "" && link in settings.trolls)) {
      // If poster is a troll, strip A tag, add troll class, and hide comment body
      var $body = $this.html(name).siblings("a.ignore").text(UNIGNORE).closest("div").addClass("troll").children("p, blockquote, img, iframe");
      if (!settings.showUnignore) {
        $this.siblings("a.ignore").hide().prev("span.pipe").hide();
      }

      if (smoothTransitions) {
        $body.slideUp();
      } else {
        $body.hide();
      }
    } else if (smoothTransitions && $ignore.text() === UNIGNORE) {
      // Unhide unignored trolls
      $this.siblings("a.ignore").text(IGNORE).closest("div").removeClass("troll").children("p, blockquote").slideDown();
    }
  });
}

function lightsOut() {
  // When clicking on an image in the article, darken page and center image
  var $overlay = $("<div>").attr("id", "ableLightsOut").css("height", $(document).height());
  var $box = $("<div>").attr("id", "ableLightsOutBox").keepCentered();
  
  // Routine for turning lights on
  var turnLightsOn = function() {
    lightsOn = false;
    $overlay.fadeOut();
    $box.fadeOut();
  };
  
  $("body").append($box.click(turnLightsOn)).append($overlay.click(turnLightsOn));
  
  // Turns lights back on if escape key is pressed
  $(window).keydown(function(e) {
    if (lightsOn && e.which === ESCAPE_KEY) {
      turnLightsOn();
    }
  });
}

function gravatars() {
  // Add gravatars in the top right corner of each post
  if (settings.showGravatar) {
    $(".commentheader > strong").each(function() {
      var $this = $(this);
      var $link = $("a", $this);
      var hash = "";

      // Create hash based on poster link or name
      if ($this.text() === "Amakudari") {
        // Me
        hash = MY_MD5;
      } else if ($link.size() === 0) {
        // No link
        hash = md5($this.text());
      } else if ($link.attr("href").indexOf("mailto:") > -1) {
        // Email address
        hash = md5($link.attr("href").replace("mailto:", ""));
      } else {
        // URL
        hash = md5($link.attr("href"));
      }
      
      var $img = $("<img>").addClass("ableGravatar").attr("src", AVATAR_PREFIX + hash + AVATAR_SUFFIX);
      $(this).closest("div").prepend($img);
    });
  }
}

function formatDate(milliseconds) {
  // Format date like November 23, 1984
  var date = new Date(milliseconds);
  return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function buildQuickload() {
  // May load beforehand if comments haven't been opened yet. In that case, make sure
  // this doesn't run again
  if ($("#ableQuick").size() === 0) {
    if (settings.history.length > 0) {
      // Set up quickload bar
      var $ul = $("<ul>");
      var date = "";
      var count = 0;
      
      $.each(settings.history, function(index, value) {
        if (count++ <= QUICKLOAD_MAX_ITEMS) {
          var shortenMatch = ARTICLE_SHORTEN_REGEX.exec(value.url)[FIRST_MATCH];
          var temp = formatDate(value.timestamp);

          if (temp !== date) {
            date = temp;
            $ul = $ul.prepend($("<li>").append($("<h2>").text(date)).append($("<ul>")));
          }

          $ul = $("li:first ul", $ul)
            .prepend($("<li>")
                .append($("<a>").attr("href", "http://reason.com/" + value.url + "#comment_" + value.permalink)
                  .text(shortenMatch + " (" + value.permalink + ")"))).parent().parent();
        }
      });
      var $quickload = $("<div>").attr("id", "ableQuick")
        .append($("<h3>").text(COMMENT_HISTORY))
        .append($ul)
        .hover(function() { $ul.slideDown(QUICKLOAD_SPEED); }, function() { $ul.slideUp(QUICKLOAD_SPEED); });
      $("body").append($quickload.append($ul));
    }
  }
}

function historyAndHighlight() {
  if (settings.keepHistory || settings.highlightMe) {
    var permalink = 0;
 
    if (settings.name != "null" && settings.name != "") {
        $("h2.commentheader > strong:contains('" + settings.name + "') ~ a.permalink").each(function() {
          if (settings.keepHistory) {
            var temp = parseFloat($(this).attr("href").replace("#comment_", ""));
            if (temp > permalink) {
              permalink = temp;
            }
          }
          if (settings.highlightMe) {
            $(this).closest("div").addClass("ableMe");
          }
        });
    }

    if (settings.keepHistory) {
      // Add to history
      if (permalink !== 0) {
        var urlMatches = ARTICLE_REGEX.exec(window.location.href);
        chrome.extension.sendRequest({type: "keepHistory", url: urlMatches[1], permalink: permalink}, function(response) {
          if (!response.exists) {
            // Add to history if background script returns that this post is new
            settings.history.unshift({timestamp: response.timestamp, url: urlMatches[1], permalink: permalink});
          }
          buildQuickload();
        });
      } else {
        buildQuickload();
      }
    }
  }
}

function quickInsert(tag, attrs, $textarea) {
  // Get beginning, middle and end of text selected
  var textarea = $textarea[0];
  var text = $textarea.val();
  var startPos = textarea.selectionStart;
  var endPos = textarea.selectionEnd;
  var startText = text.substr(0, startPos);
  var midText = text.substr(startPos, endPos - startPos);
  var endText = text.substr(endPos);

  var startTag = "<" + tag;
  var endTag = "</" + tag + ">";
  if (attrs !== null) {
    $.each(attrs, function(name, attr) {
      startTag += " " + attr + "=\"" + prompt("Enter " + name + ":") + "\"";
    });
  }
  startTag += ">";
  $textarea.val(startText + startTag + midText + endTag + endText).focus();
  textarea.selectionStart = startPos + startTag.length;
  textarea.selectionEnd = endPos + startTag.length;
  return false; // prevent going to # anchor
}

function buildQuickInsert() {
  var buildToolbar = function($textarea) {
    $textarea.before($("<div>").addClass("ableInsert")
      .append($("<a>").attr("href", "#").text("link").click(function() { return quickInsert("a", {"URL": "href"}, $textarea); }))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("quote").click(function() { return quickInsert("blockquote", null, $textarea); }))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("bold").click(function() { return quickInsert("b", null, $textarea); }))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("italic").click(function() { return quickInsert("i", null, $textarea); }))
      .append($("<span>").addClass("pipe").text(" | "))
      .append($("<a>").attr("href", "#").text("strike").click(function() { return quickInsert("s", null, $textarea); })));
  };

  $("textarea").each(function() {
    buildToolbar($(this));
  });
  $(".comment_reply.submit").click(function() {
    buildToolbar($(this).parent().next(".leave-comment.reply").find("textarea"));
  });
}

// Main routine
// Only run these if there is a comment section displayed
var commentOnlyRoutines = function() {
  gravatars();
  viewThread();
  blockTrolls(false);
  historyAndHighlight();
  setTimeout(function() { updatePosts(); }, UPDATE_POST_TIMEOUT_LENGTH);
};

// Content scripts can't access local storage directly,
// so we have to wait for info from the background script before proceeding
chrome.extension.sendRequest({type: "settings"}, function(response) {
  defaultSettings.trolls = response.trolls;
  getSettings(response, defaultSettings);
  lightsOut();
  altText();
  showMedia();
  buildQuickInsert();

  // Run automatically if comments are open, otherwise bind to the click
  // event for the comment opener link
  if (window.location.href.indexOf("#comment") !== -1) {
    commentOnlyRoutines();
  } else {
    buildQuickload();
    
    // Fire only once
    $("div#commentcontrol").one("click", commentOnlyRoutines);
  }
});
