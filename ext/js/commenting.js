(function() {
  var buildQuickInsert, quickInsert;
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
}).call(this);
