# Content scripts can't access local storage directly,
# so we have to wait for info from the background script before proceeding
chrome.extension.sendRequest method: "settings", (response) ->
  Settings.load response.settings
  Filter.load Settings.filters

  # Load extensions for comments
  Comment.addExtension new Comment.GravatarExtension() if Settings.showGravatar
  Comment.addExtension new Comment.ImageExtension()    if Settings.showPictures
  Comment.addExtension new Comment.YouTubeExtension()  if Settings.showYouTube

  # Load extensions for posts
  Post.addExtension new Post.AltTextExtension() if Settings.showAltText

  Post.load(Filter.all).runEverything()

  if Post.comments?
    Markup.load()

  History.load()
  Controls.load()
