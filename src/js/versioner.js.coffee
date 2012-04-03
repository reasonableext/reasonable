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

    if @ports?
      for port in @ports
        if port.version > settingsVersion
          console.debug port.version
          port.callback()

    Settings.version = @getVersion()
    Settings.save "version"

  @parseVersionString: (str) ->
    parseInt(num) for num in str.split(".")
