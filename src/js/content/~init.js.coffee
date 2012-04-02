# Only run these if there is a comment section displayed
commentOnlyRoutines = ->
  gravatars()
  viewThread()
  blockTrolls false
  historyAndHighlight()
  showActivity()
  setTimeout ( () -> updatePosts() ), UPDATE_POST_TIMEOUT_LENGTH

# Content scripts can't access local storage directly,
# so we have to wait for info from the background script before proceeding
chrome.extension.sendRequest method: "settings", (response) ->
  Filter.load response.settings.filters
  post = new Post(Filter.all)
  console.debug post
  for comment in post.comments
    console.debug comment
    comment.hide() if comment.isTroll()
    comment.addControls()
  settings = response.settings

  removeGooglePlus()
  lightsOut()
  altText()
  showMedia()
  buildQuickInsert()

  # Run automatically if comments are open, otherwise bind to the click
  # event for the comment opener link
  if window.location.href.indexOf("#comment") is -1
    buildQuickload()

    # Fire only once
    $("div#commentcontrol").one "click", commentOnlyRoutines
  else
    commentOnlyRoutines()
