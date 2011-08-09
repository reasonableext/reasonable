getSettings = (response, defaults) ->
  reset = false

  # Use saved settings if they exist
  temp = response.settings ? {}
  
  for key, value of defaults
    switch temp[key]
      when undefined
        temp[key] = value
        reset = true
      when "true"  then temp[key] = true
      when "false" then temp[key] = false # prevents boolean true from being stored as text
      else
        # Some operations need to be done on the trolls and history settings
        switch key
          when "trolls"
            arr = JSON.parse temp.trolls
            temp.trolls = {}

            $.each arr, (trollKey, trollValue) ->
              if trollValue is actions.black.value or (temp.hideAuto and trollValue is actions.auto.value)
                temp.trolls[trollKey] = trollValue
          when "history"
            try
              temp.history = JSON.parse(temp.history).sort (a,b) -> a.permalink - b.permalink
            catch error
              temp = []

  # Store settings, then save anything that had to be reset
  settings = temp
  chrome.extension.sendRequest { type: "reset", settings: temp } if reset

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
  defaultSettings.trolls = response.trolls
  getSettings response, defaultSettings
  removeGooglePlus()
  lightsOut()
  altText()
  showMedia()
  buildQuickInsert()

  # Run automatically if comments are open, otherwise bind to the click
  # event for the comment opener link
  if window.location.href.indexOf("#comment") is -1
    buildQuickload()
    $("div#commentcontrol").one "click", commentOnlyRoutines # fire only once
  else
    commentOnlyRoutines()
