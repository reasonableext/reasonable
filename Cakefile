{exec} = require 'child_process'
util   = require 'util'

task 'build:test', 'Build project from source to test', (options) ->
  util.log 'Converting SCSS files to CSS...'
  exec 'sass src/scss/options.scss:test/css/options.css'
  exec 'sass src/scss/reasonable.scss:test/css/reasonable.css'

  util.log 'Converting CoffeeScript to JavaScript...'
  exec 'coffee --compile --output test/js/ src/coffee/', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

  util.log 'Copying images, HTML and manifest to test...'
  exec 'cp -r src/img test'
  exec 'cp -r src/html/* test'
  exec 'cp -r src/manifest.json test/manifest.json'

task 'zip', 'Create a zip of the compiled library', (options) ->
  exec 'zip -r extension.zip lib'
  util.log "Zipped lib directory to extension.zip"
