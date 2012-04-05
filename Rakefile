require "fileutils"
require "jasmine"
require "RedCloth"

require_relative "spec/support/jasmine_config.rb"
load "jasmine/tasks/jasmine.rake"

@debug        = true
ROOT_DIR      = File.expand_path(File.dirname(__FILE__))
CHROME_DIR    = File.join(ROOT_DIR, "chrome")
FIREFOX_DIR   = File.join(ROOT_DIR, "firefox")
SOURCE_DIR    = File.join(ROOT_DIR, "src")
STATIC_EXTENSIONS = %w(png)
BROWSERS = {
  chrome:  CHROME_DIR,
  firefox: FIREFOX_DIR
}

def verify_directory(path)
  FileUtils.mkdir_p(path) unless File.directory?(path)
end

def verify_extension_structure
  verify_directory CHROME_DIR
  %w(css img js).each do |subdirectory|
    verify_directory File.join(CHROME_DIR, subdirectory)
  end
end

def manifest
  require "json"
  @manifest ||= JSON.parser.new(File.read(File.join(CHROME_DIR, "manifest.json"))).parse
end

def compile_sources(input_type, opts = {})
  verify_extension_structure

  output_dir = File.join(CHROME_DIR, opts[:output_dir] || "")
  input_dir  = File.join(SOURCE_DIR,    opts[:input_dir]  || "")
  subdir_search = opts[:merge_subdirectories] ? "*" : "**"

  puts input_type
  Dir[File.join(input_dir, subdir_search, "*.*.#{input_type}")].each do |path|
    sub_path      = path.sub(input_dir, "").sub(/^[\/.]+/, "")
    output_name   = File.basename(path, ".*")
    relative_path = File.join(File.dirname(sub_path), output_name).sub(/^[\/.]+/, "")
    output_path   = File.join(output_dir, relative_path)

    File.open(output_path, "w") do |handle|
      puts "  #{relative_path}"
      handle.puts yield(File.read(path))
    end
  end

  if opts[:merge_subdirectories]
    Dir[File.join(input_dir, "*", "*/")].each do |subdir|
      files         = Dir[File.join(subdir, "**/*.*.#{input_type}")].sort
      extension     = File.basename(files[0], ".*").split(".").last
      result        = files.map { |p| File.read(p) }.join("\n")
      sub_paths     = subdir.sub(input_dir, "").sub(/^[\/.]+/, "").split("/")
      output_name   = "#{sub_paths.pop}.#{extension}"
      sub_path      = sub_paths.join("/")
      relative_path = File.join(sub_path, output_name).sub(/^[\/.]+/, "")
      output_path   = File.join(output_dir, relative_path)

      File.open(output_path, "w") do |handle|
        puts "  #{relative_path}"
        handle.puts yield(result)
      end

      files.each { |p| puts "    #{p.sub(subdir, "")}" }
    end
  end
end

namespace :build do
  desc "Compile CoffeeScript to JavaScript"
  task :coffee do
    require "coffee-script"
    require "uglifier"
    opts = { :merge_subdirectories => true }
    compile_sources("coffee", opts) do |content|
      js = CoffeeScript.compile(content, :bare => true)
      if @debug
        js
      else
        Uglifier.compile js
      end
    end
  end

  desc "Compile HAML to HTML"
  task :haml do
    require "haml"
    compile_sources("haml") do |content|
      Haml::Engine.new(content).render
    end
  end

  desc "Compile SASS to CSS"
  task :sass do
    require "sass"
    compile_sources("sass") do |content|
      Sass::Engine.new(content).render
    end
  end

  desc "Compile YAML to JSON"
  task :yml do
    require "yaml"
    require "json"
    compile_sources("yml") do |content|
      json = YAML.load(content).to_json
      JSON.pretty_generate JSON.parse(json)
    end
  end
end

namespace :jasmine do
  desc "Compile CoffeeScript specs to JavaScript specs"
  task :compile do
    opts = { input_dir: "../spec", output_dir: "../spec" }
    compile_sources("coffee", "js", opts) do |content|
      CoffeeScript.compile content, :bare => true
    end
  end
end

desc "Copy uncompiled assets from src/ to ext/"
task :raw do
  verify_extension_structure
  STATIC_EXTENSIONS.each do |ext|
    puts ext
    Dir[File.join(SOURCE_DIR, "**", "*.#{ext}")].each do |path|
      relative_path = path.sub(SOURCE_DIR, "").sub(/^\//, "")
      puts "  #{relative_path}"
      FileUtils.cp path, File.join(CHROME_DIR, relative_path)
    end
  end

  # Copy over licenses
  puts "license"
  %w(BEERWARE-LICENSE MIT-LICENSE).each do |license|
    puts "  #{license}"
    FileUtils.cp File.expand_path(license), File.join(CHROME_DIR, license)
  end
end

desc "Zip extension"
task :zip do
  base_name = "#{manifest["name"]}_#{manifest["version"]}"
  full_name = File.join(ROOT_DIR, base_name)

  FileUtils.rm Dir["#{full_name}.*"]

  # Chrome
  Dir.chdir(CHROME_DIR) do
    puts %x[zip -T #{full_name}.zip *.* **/*.*]
  end

  # Firefox
  if ENV["MOZ_TOOLS"].nil?
    puts "Environment variable MOZ_TOOLS doesn't exist"
    puts "Set this variable to point to the location of the Firefox Add-on SDK"
  else
    puts %x[cd $MOZ_TOOLS && source bin/activate && cd #{FIREFOX_DIR} && cfx xpi]
    FileUtils.mv File.join(FIREFOX_DIR, "reasonable.xpi"), "#{full_name}.xpi"
  end
end

desc "Turn debug off"
task :production do
  @debug = false
end

desc "Run some file organization tasks for browser-specific implementations"
task :browser do
  FileUtils.rm_rf FIREFOX_DIR
  FileUtils.cp_r  CHROME_DIR, FIREFOX_DIR

  # Chrome
  %w(package.json).each do |path|
    full_path = File.join(CHROME_DIR, path)
    File.delete full_path if File.exist?(full_path)
  end

  # Firefox
  Dir.chdir(FIREFOX_DIR) do
    FileUtils.mv "js", "data"
    FileUtils.mkdir "lib"
    FileUtils.mv "data/background.js", "lib/main.js"
    FileUtils.mv "img/icon_48.png", "data/icon.png"
    FileUtils.rm_rf "img"
    FileUtils.rm "manifest.json"
  end
end

desc "Compile and copy over all extension files"
task :build => [:production, "build:coffee", "build:haml", "build:sass", "build:yml",
                :browser, :raw, :zip]

desc "Compile and copy over all extension files but leave human-readable"
task "build:debug" => ["build:coffee", "build:haml", "build:sass", "build:yml",
                       :browser, :raw, :zip]

desc "Compile spec CoffeeScripts and setup tests"
task :spec => ["jasmine:compile", "jasmine"]
