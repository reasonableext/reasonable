TIMESTAMP = 15500
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
      "\\bWI\\b":                     TIMESTAMP
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
    filters:      BASIC_FILTERS
    hideAuto:     true
    history:      []
    queue:        []
    shareTrolls:  true
    showAltText:  true
    showHistory:  true
    showGravatar: false
    showPictures: true
    showYouTube:  true
    submitted:    0
    username:     ""

  # Returns the numbers of days since the Unix epoch
  @timestamp: ->
    parseInt new Date / 86400000
