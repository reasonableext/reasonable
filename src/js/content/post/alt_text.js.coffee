class Post.AltTextExtension
  run: (post) ->
    for image in post.node.getElementsByTagName("img")
      if image.title
        # Create alt text
        alt  = document.createElement("div")
        alt.className = "ableAltText"
        alt.style.width = "#{image.width}px"
        text = document.createTextNode(image.title)
        alt.appendChild text

        image.className += " ableAltTextImage"

        if image.nextSibling?
          image.parentNode.insertBefore alt, image.nextSibling
        else
          image.parentNode.appendChild alt
