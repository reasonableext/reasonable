class Settings
  @load: (json) ->
    for own key, value of json
      this[key] = value
