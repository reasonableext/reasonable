class Versioner
  @getVersion: ->
    return @version if @version?
    xmlhttp = new XMLHttpRequest()
    xmlhttp.open "GET", "manifest.json", no
    xmlhttp.send null
    @version = JSON.parse(xmlhttp.responseText).version

  @addPort: (version, callback) ->
    @ports ?= []
    @ports.push version: @parseVersionString(version), callback: callback

  @runPorts: ->
    settingsVersion = @parseVersionString(Settings.version)
    manifestVersion = @parseVersionString(@getVersion())

    if @ports?
      for port in @ports
        if port.version > settingsVersion and port.version <= manifestVersion
          port.callback()

    Settings.version = @version
    Settings.save "version"

  @parseVersionString: (str) ->
    parseInt(num) for num in str.split(".")
