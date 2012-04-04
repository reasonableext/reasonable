# Add ports to help people along
Versioner.addPort "2.0.9", ->
  Settings.filters?.regex?.name?["^\\s"] = TIMESTAMP

Versioner.addPort "2.1.0", ->
  for key in [ "admin", "autohideActivity", "autohideHistory", "gambolLockdown", "lookupFrequency",
               "name", "showUnignore", "trolls", "updatePosts"]
    delete localStorage[key]
    delete Settings[key]

Versioner.addPort "2.1.2", ->
  Settings.submitted = 0
  Settings.save "submitted"

Versioner.runPorts()
