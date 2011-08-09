fs = require 'fs'
exec = require('child_process').exec
path = require 'path'

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

errorLog = (err, stdout, stderr) -> throw err if err
verifyTarget = (target) -> fs.mkdir target, 0777 unless path.existsSync target

build = (target, environment) ->
  console.log "\n\033[32mCompiling #{environment} build...\033[0m"
  buildSCSS   target
  buildCoffee target
  buildHAML   target
  buildOther  target

concatenate = (directory, files, extension = "") ->
  result = []
  result.push "#{directory}/#{file}#{if extension is "" then "" else ".#{extension}"}" for file in files
  result.join " "

task 'build', 'Build project from source to dev', (options) ->
  target ?= "lib"
  invoke "coffee"
  invoke "scss"
  invoke "haml"
  invoke "other"

task 'clear', 'Clear lib directory', (options) ->
  exec "rm -rf lib/*"

# Individual filetypes
task 'coffee', 'Compile CoffeeScript to development', (options) ->
  verifyTarget target
  target ?= "lib"
  fs.readdir "src/coffee", (err, scripts) ->
    console.log 'Coffee -> JS'
    for script in scripts
      if path.extname(script) is ""
        console.log "  #{script}/"
        console.log "    #{subscript}.coffee" for subscript in contentScripts
        exec "coffee --compile --join #{script}.js --output #{target}/js/
              #{concatenate "src/coffee/content", contentScripts, "coffee"}", errorLog
      else
        console.log "  #{script}"
        exec "coffee --compile --output #{target}/js/ src/coffee/#{script}", errorLog

task 'haml', 'Compile HAML to development', (options) ->
  target ?= "lib"
  verifyTarget target
  fs.readdir "src/haml", (err, pages) ->
    console.log 'HAML   -> HTML'
    for page in pages
      console.log "  #{page}"
      exec "haml src/haml/#{page} #{target}/#{page.replace ".haml", ".html"}", errorLog

task 'scss', 'Compile SCSS files to development', (options) ->
  target ?= "lib"
  verifyTarget target
  fs.readdir "src/scss", (err, sheets) ->
    console.log 'SCSS   -> CSS'
    for sheet in sheets
      console.log "  #{sheet}"
      exec "sass --no-cache src/scss/#{sheet}:#{target}/css/#{sheet.replace ".scss", ".css"}", errorLog

task 'other', 'Copy other files to development', (options) ->
  target ?= "lib"
  verifyTarget target
  console.log 'Other: static CSS, images, HTML, vendor JavaScript and manifest'
  exec "cp -r src/css #{target}", errorLog
  exec "cp -r src/img #{target}", errorLog
  exec "cp -r vendor/js #{target}", errorLog
  exec "cp -r src/manifest.json #{target}/manifest.json", errorLog

# Zipping
task 'zip', 'Create a zip of the compiled library', (options) ->
  console.log "\n\033[32mZipping extension...\033[0m"
  exec 'zip -r extension.zip lib'
  console.log "Zipped lib directory to extension.zip"
