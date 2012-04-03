require "fileutils"
require "jasmine"
require "RedCloth"

require_relative "spec/support/jasmine_config.rb"
load "jasmine/tasks/jasmine.rake"

DEBUG         = true
ROOT_DIR      = File.expand_path(File.dirname(__FILE__))
EXTENSION_DIR = File.join(ROOT_DIR, "ext")
SOURCE_DIR    = File.join(ROOT_DIR, "src")
STATIC_EXTENSIONS = %w(png)

def verify_directory(path)
  FileUtils.mkdir_p(path) unless File.directory?(path)
end

def verify_extension_structure
  verify_directory EXTENSION_DIR
  %w(css img js).each do |subdirectory|
    verify_directory File.join(EXTENSION_DIR, subdirectory)
  end
end

def manifest
  require "json"
  @manifest ||= JSON.parser.new(File.read(File.join(EXTENSION_DIR, "manifest.json"))).parse
end

def compile_sources(input_type, opts = {})
  verify_extension_structure

  output_dir = File.join(EXTENSION_DIR, opts[:output_dir] || "")
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
      if DEBUG
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

  desc "Compile and copy over all extension files but leave human-readable"
  task :debug => [:coffee, :haml, :sass, :yml]
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
      FileUtils.cp path, File.join(EXTENSION_DIR, relative_path)
    end
  end
end

desc "Zip extension"
task :zip do
  base_name = "#{manifest["name"]}_#{manifest["version"]}.zip"
  zip_name  = File.join(ROOT_DIR, base_name)

  File.delete(zip_name) if File.exists?(zip_name)

  puts base_name
  Dir.chdir(EXTENSION_DIR) do
    puts %x[zip -T #{zip_name} *.* **/*.*]
  end
end

desc "Turn debug off"
task :production do
  DEBUG = false
end

desc "Compile and copy over all extension files"
task :build => [:production, "build:coffee", "build:haml", "build:sass", "build:yml", :raw]

desc "Compile spec CoffeeScripts and setup tests"
task :spec => ["jasmine:compile", "jasmine"]
