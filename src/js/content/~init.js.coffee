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
chrome.extension.sendRequest { type: "settings" }, (response) ->
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

Filter.add "regex", "content", "f(i|1)bertar(ian|d)"
Filter.add "regex", "content", "city(.?)stat(e|ism)"
console.debug Filter.serialize()
post = new Post(Filter.all)
for comment in post.comments
  comment.hide() if comment.isTroll()
  comment.addControls()
