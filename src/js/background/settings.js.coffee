TIMESTAMP = 0
BASIC_FILTERS =
  string:
    name:
      "Mary Stack":                   TIMESTAMP
      "Newt Paul":                    TIMESTAMP
    link:
      "http://rctlfy.wordpress.com/": TIMESTAMP
    content:
      "I disavow.":                   TIMESTAMP
      "KOCH":                         TIMESTAMP
      "gambol":                       TIMESTAMP
      "godesky":                      TIMESTAMP
      "market fundamentalist":        TIMESTAMP
      "marxism of the right":         TIMESTAMP
      "worst chat room":              TIMESTAMP
      "zerzan":                       TIMESTAMP
  regex:
    name:
      "^\\s":                         TIMESTAMP
      "\\bWI\\b":                     TIMESTAMP
      "^.+heller|heller.+$":          TIMESTAMP
      "bi.*lover":                    TIMESTAMP
      "f[i1]bertar(d|ian)":           TIMESTAMP
      "l[i1]bertard":                 TIMESTAMP
      "mary stack":                   TIMESTAMP
      "registration":                 TIMESTAMP
    link:
      "burberry":                     TIMESTAMP
      "coach":                        TIMESTAMP
      "nike":                         TIMESTAMP
    content:
      "city-stat(e|is[mt])":          TIMESTAMP
      "f[i1]bertar(d|ian)":           TIMESTAMP

class Settings
  @all: ->
    temp = {}
    temp[key] = this[key] for key of @defaults
    temp

  @load: ->
    # Load parsed values from local storage
    this[key] = JSON.parse(value) for key, value of XBrowser.storage

    # Set undefined settings to defaults
    for key, value of @defaults
      unless key of this
        this[key] = value
        @save key

  @save: (key) ->
    if this[key]?
      # Save key if specified
      XBrowser.save key, this[key]
    else
      # Save everything if unspecified
      XBrowser.save key, this[key] for key of @defaults

  @defaults:
    autoFilters:  {
                    string:
                      name: {}
                      link: {}
                      content: {}
                    regex:
                      name: {}
                      link: {}
                      content: {}
                  }
    blockIframes: no
    filters:      BASIC_FILTERS
    fixPreview:   yes
    hideAuto:     yes
    markUnread:   yes
    history:      []
    lastIDs:      {}
    userID:       (Math.floor(Math.random() * 16).toString(16) for i in [0...32]).join("")
    previousURL:  ""
    shareTrolls:  yes
    showAltText:  yes
    showHistory:  yes
    showGravatar: no
    showPictures: yes
    showYouTube:  yes
    submitted:    0
    username:     ""
    version:      "0.0.0"

  # Returns the seconds since the Unix epoch
  @timestamp: ->
    parseInt new Date / 1000
