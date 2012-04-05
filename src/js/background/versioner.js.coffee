class Versioner
  @addPort: (version, callback) ->
    @ports ?= []
    @ports.push version: @parseVersionString(version), callback: callback

  @runPorts: ->
    settingsVersion = @parseVersionString(Settings.version)
    manifestVersion = @parseVersionString(VERSION)

    if @ports?
      for port in @ports
        if port.version > settingsVersion and port.version <= manifestVersion
          port.callback()

    Settings.version = @version
    Settings.save "version"

  @parseVersionString: (str) ->
    parseInt(num) for num in str.split(".")
