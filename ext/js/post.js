var Post;

Post = (function() {
  var extract_comments;

  function Post() {
    this.comments = extract_comments();
  }

  extract_comments = function() {
    var block, container, _i, _len, _ref, _results;
    container = document.getElementById("commentcontainer");
    if (container != null) {
      _ref = container.getElementsByClassName("com-block");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        block = _ref[_i];
        _results.push(new Comment(block));
      }
      return _results;
    } else {
      return null;
    }
  };

  return Post;

})();
