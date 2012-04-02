class Settings
  @all: ->
    temp = {}
    temp[key] = this[key] for key of @defaults
    temp

  @load: ->
    # Load parsed values from local storage
    this[key] = JSON.parse(value) for key, value of localStorage

    # Set undefined settings to defaults
    for key, value of @defaults
      unless key of this
        this[key] = value
        @save key

  @save: (key) ->
    if this[key]?
      # Save key if specified
      localStorage[key] = JSON.stringify(this[key])
    else
      # Save everything if unspecified
      localStorage[key] = JSON.stringify(this[key]) for key of @defaults

  @defaults:
    blockIframes: false
    filters:      {
                    string: name: {}, link: {}, content: {}
                    regex:  name: {}, link: {}, content: {}
                  }
    hideAuto:     true
    history:      []
    name:         ""
    shareTrolls:  true
    showAltText:  true
    showActivity: true
    showGravatar: false
    showPictures: true
    showYouTube:  true
    submitted:    0

  # Returns the numbers of days since the Unix epoch
  @timestamp: -> parseInt(new Date / 86400000)
