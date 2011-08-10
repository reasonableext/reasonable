(function() {
  var updatePosts;
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
}).call(this);
