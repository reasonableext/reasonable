# Yeah, yeah, I'll do a better job with node.js later

fs = require 'fs'
{exec} = require 'child_process'
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

buildCoffee = (target) ->
  fs.readdir "src/coffee", (err, scripts) ->
    console.log 'Coffee -> JS'
    for script in scripts
      if path.extname(script) is ""
        console.log "  #{script}/"
        console.log "    #{subscript}.coffee" for subscript in contentScripts
        exec "coffee --compile --join #{script}.js --output #{target}/js/
              #{concatenate "src/coffee", contentScripts, "js"}"
      else
        console.log "  #{script}"
        exec "coffee --compile --output #{target}/js/ src/coffee/#{script}"

buildHAML = (target) ->
  fs.readdir "src/haml", (err, pages) ->
    console.log 'HAML   -> HTML'
    for page in pages
      console.log "  #{page}"
      exec "haml src/haml/#{page} #{target}/#{page.replace ".haml", ".html"}"

buildSCSS = (target) ->
  fs.readdir "src/scss", (err, sheets) ->
    console.log 'SCSS   -> CSS'
    for sheet in sheets
      console.log "  #{sheet}"
      exec "sass --no-cache src/scss/#{sheet}.scss:#{target}/css/#{sheet}.css"

buildOther = (target) ->
  console.log 'Other: static CSS, images, HTML, vendor JavaScript and manifest'
  exec "cp -r src/css #{target}"
  exec "cp -r src/img #{target}"
  exec "cp -r vendor/js #{target}"
  exec "cp -r src/manifest.json #{target}/manifest.json"

build = (target, environment) ->
  console.log "\n\033[32mCompiling #{environment} build...\033[0m"
  fs.mkdir target, 0777 unless path.existsSync target
  buildSCSS   target
  buildCoffee target
  buildHAML   target
  buildOther  target

concatenate = (directory, files, extension = "") ->
  result = []
  result.push "#{directory}/#{file}#{if extension is "" then "" else ".#{extension}"}" for file in files
  result.join " "

task 'build', 'Build project to lib (production)', (options) ->
  build "lib", "production"
  invoke "zip"

task 'build:dev', 'Build project from source to dev', (options) ->
  build "dev", "development"

task 'zip', 'Create a zip of the compiled library', (options) ->
  console.log "\n\033[32mZipping extension...\033[0m"
  exec 'zip -r extension.zip lib'
  console.log "Zipped lib directory to extension.zip"
