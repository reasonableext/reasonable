# Yeah, yeah, I'll do a better job with node.js later

{exec} = require 'child_process'
util   = require 'util'

task 'build:dev', 'Build project from source to dev', (options) ->
  util.log 'Converting SCSS files to CSS...'
  exec 'mkdir dev'
  exec 'mkdir dev/css'
  exec 'sass src/scss/options.scss:dev/css/options.css'
  exec 'sass src/scss/reasonable.scss:dev/css/reasonable.css'

  util.log 'Converting CoffeeScript to JavaScript...'
  exec 'coffee --compile --output dev/js/ src/coffee/*.coffee', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
  exec 'coffee --compile --join content.js --output dev/js/ src/coffee/content/', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

  util.log 'Copying images, HTML, vendor JavaScript, and manifest to dev...'
  exec 'cp -r src/img dev'
  exec 'cp -r src/html/* dev'
  exec 'cp -r vendor/js dev'
  exec 'cp -r src/manifest.json dev/manifest.json'

task 'zip', 'Create a zip of the compiled library', (options) ->
  exec 'zip -r extension.zip lib'
  util.log "Zipped lib directory to extension.zip"
