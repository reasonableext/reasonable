# Content scripts can't access local storage directly,
# so we have to wait for info from the background script before proceeding
chrome.extension.sendRequest method: "settings", (response) ->
  Settings.load response.settings
  Filter.load Settings.filters

  # Load extensions for comments
  Comment.addExtension new Comment.GravatarExtension() if Settings.showGravatar
  Comment.addExtension new Comment.ImageExtension()    if Settings.showImage
  Comment.addExtension new Comment.YouTubeExtension()  if Settings.showYouTube

  Post.load(Filter.all).runEverything()

  History.load()
  Controls.load()
