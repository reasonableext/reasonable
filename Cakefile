{exec} = require 'child_process'

task 'build:test', 'Build project from source to test', (options) ->
  console.log 'Converting SCSS files to CSS...'
  exec 'sass src/scss/options.scss:test/css/options.css'
  exec 'sass src/scss/reasonable.scss:test/css/reasonable.css'

  console.log 'Converting CoffeeScript to JavaScript...'
  exec 'coffee --compile --output test/js/ src/coffee/', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr

  console.log 'Copying images, HTML and manifest to test...'
  exec 'cp -r src/img test'
  exec 'cp -r src/html/* test'
  exec 'cp -r src/manifest.json test/manifest.json'

task 'zip'
