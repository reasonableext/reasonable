# Yeah, yeah, I'll do a better job with node.js later

{exec} = require 'child_process'
util   = require 'util'

contentScripts = [
  "vars"
  "trolls"
  "thread"
  "article"
  "commenting"
  "history"
  "realtime"
  "init"
]

build = (target) ->
  util.log 'Converting SCSS files to CSS...'
  exec "mkdir #{target}"
  exec "mkdir #{target}"
  exec "sass src/scss/options.scss:#{target}/css/options.css"
  exec "sass src/scss/content.scss:#{target}/css/content.css"

  util.log 'Converting CoffeeScript to JavaScript...'
  exec "coffee --compile --output #{target}/js/ src/coffee/*.coffee", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
  exec "coffee --compile --join content.js --output #{target}/js/ #{concatenate "src/coffee/content", contentScripts, "coffee"}", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

  util.log 'Copying static CSS, images, HTML, vendor JavaScript, and manifest...'
  exec "cp -r src/css #{target}"
  exec "cp -r src/img #{target}"
  exec "cp -r src/html/* #{target}"
  exec "cp -r vendor/js #{target}"
  exec "cp -r src/manifest.json #{target}/manifest.json"

concatenate = (directory, files, extension) ->
  result = []
  result.push "#{directory}/#{file}.#{extension}" for file in files
  result.join " "

task 'build', 'Build project to lib (production)', (options) ->
  build "lib"
  invoke "zip"

task 'build:dev', 'Build project from source to dev', (options) ->
  build "dev"

task 'zip', 'Create a zip of the compiled library', (options) ->
  exec 'zip -r extension.zip lib'
  util.log "Zipped lib directory to extension.zip"
