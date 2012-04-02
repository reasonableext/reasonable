class Comment.GravatarExtension
  AVATAR_PREFIX: "http://www.gravatar.com/avatar/"
  AVATAR_SUFFIX: "?s=40&d=identicon"
  MY_MD5:        "b5ce5f2f748ceefff8b6a5531d865a27"

  run: (comment) ->
    if comment.name is "Amakudari"
      hash = @MY_MD5
    else if comment.link?
      hash = MD5.hexDigest(comment.link.replace("mailto:", ""))
    else
      hash = MD5.hexDigest(comment.name)
    
    image = document.createElement("img")
    image.className = "ableGravatar"
    image.src = @AVATAR_PREFIX + hash + @AVATAR_SUFFIX
    comment.node.insertBefore image, comment.node.firstChild
