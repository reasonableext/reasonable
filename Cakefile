PADDING = 24

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

# String repetition function
repeat = (pattern, count) ->
  return '' if count < 1
  result = ''
  while count > 0
    result += pattern if count & 1
    count >>= 1
    pattern += pattern
  result

highlight = (text, formats...) -> "\033[#{formats.join ";"}m#{text}\033[0m"

pad = (text) -> text + repeat ' ', PADDING - text.length

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
  target ?= "ext"
  invoke "coffee"
  invoke "scss"
  invoke "haml"
  invoke "other"

task 'clear', 'Clear ext directory', (options) ->
  exec "rm -rf ext/*"

# Individual filetypes
task 'coffee', 'Compile CoffeeScript to development', (options) ->
  verifyTarget target
  target ?= "ext"

  fs.readdir "src/coffee", (err, scripts) ->
    console.log highlight 'Coffee -> JS (source)', 1, 32
    for script in scripts
      if path.extname(script) is ""
        console.log pad("  #{script}/") + highlight(script + ".js", 1)
        console.log "    #{subscript}.coffee" for subscript in contentScripts
        exec "coffee --compile --join #{script}.js --output #{target}/js/
              #{concatenate "src/coffee/content", contentScripts, "coffee"}", errorLog
      else
        console.log pad("  #{script}") + highlight(script.replace(".coffee", ".js"), 1)
        exec "coffee --compile --output #{target}/js/ src/coffee/#{script}", errorLog

  fs.readdir "lib/coffee", (err, scripts) ->
    console.log highlight 'Coffee -> JS (library)', 1, 32
    for script in scripts
      console.log pad("  #{script}") + highlight(script.replace(".coffee", ".js"), 1)
      exec "coffee --compile --output #{target}/js/ lib/coffee/#{script}", errorLog

task 'haml', 'Compile HAML to development', (options) ->
  target ?= "ext"
  verifyTarget target

  fs.readdir "src/haml", (err, pages) ->
    console.log highlight 'HAML -> HTML', 1, 32
    for page in pages
      htmlPage = page.replace ".haml", ".html"
      console.log pad("  #{page}") + highlight(htmlPage, 1)
      exec "haml src/haml/#{page} #{target}/#{htmlPage}", errorLog

task 'scss', 'Compile SCSS files to development', (options) ->
  target ?= "ext"
  verifyTarget target

  fs.readdir "src/scss", (err, sheets) ->
    console.log highlight 'SCSS -> CSS', 1, 32
    for sheet in sheets
      cssSheet = sheet.replace ".scss", ".css"
      console.log pad("  #{sheet}") + highlight(cssSheet, 1)
      exec "sass --no-cache src/scss/#{sheet}:#{target}/css/#{cssSheet}", errorLog

task 'other', 'Copy other files to development', (options) ->
  target ?= "ext"
  verifyTarget target
  console.log 'Other: static CSS, images, HTML, vendor JavaScript and manifest'
  exec "cp -r src/css #{target}", errorLog
  exec "cp -r src/img #{target}", errorLog
  exec "cp -r vendor/js #{target}", errorLog
  exec "cp -r src/manifest.json #{target}/manifest.json", errorLog

# Zipping
task 'zip', 'Create a zip of the compiled extrary', (options) ->
  console.log highlight "Zipping extension...", 1, 32
  exec 'zip -r extension.zip ext'
  console.log "Zipped ext directory to extension.zip"
