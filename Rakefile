require "coffee-script"
require "fileutils"
require "haml"
require "jasmine"
require "RedCloth"
require "sass"

require_relative "spec/support/jasmine_config.rb"
load "jasmine/tasks/jasmine.rake"

EXTENSION_DIR = File.join(File.dirname(__FILE__), "ext")
SOURCE_DIR    = File.join(File.dirname(__FILE__), "src")

def verify_directory(path)
  FileUtils.mkdir_p(path) unless File.directory?(path)
end

def verify_extension_structure
  verify_directory EXTENSION_DIR
  %w(css img js).each do |subdirectory|
    verify_directory File.join(EXTENSION_DIR, subdirectory)
  end
end

def compile_sources(input_type, output_type, opts = {})
  verify_extension_structure

  # Set default arguments
  opts = {
    :top_level  => false,
    :input_dir  => "",
    :output_dir => ""
  }.merge(opts)

  output_dir = File.join(EXTENSION_DIR, opts[:output_dir], (opts[:top_level] ? "" : output_type))
  input_dir  = File.join(SOURCE_DIR, opts[:input_dir])

  puts "#{input_type} => #{output_type}"
  Dir[File.join(input_dir, input_type, "*.#{input_type}")].each do |path|
    output_name   = "#{File.basename(path, ".*")}.#{output_type}"
    output_path   = File.join(output_dir, output_name)
    relative_path = File.join(opts[:output_dir], output_name).sub(/^[\/.]+/, "")

    File.open(output_path, "w") do |handle|
      puts "  #{relative_path}"
      handle.puts yield(File.read(path))
    end
  end
end

namespace :build do
  desc "Compile CoffeeScript to JavaScript"
  task :coffee do
    compile_sources("coffee", "js") { |c| CoffeeScript.compile(c, :bare => true) }
  end

  desc "Compile HAML to HTML"
  task :haml do
    compile_sources("haml", "html", :top_level => true) { |c| Haml::Engine.new(c).render }
  end

  desc "Compile SASS to CSS"
  task :sass do
    compile_sources("sass", "css") { |c| Sass::Engine.new(c).render }
  end
end

namespace :jasmine do
  desc "Compile CoffeeScript specs to JavaScript specs"
  task :compile do
    compile_sources("coffee", "js", :input_dir => "../spec", :output_dir => "../spec" ) { |c| CoffeeScript.compile(c, :bare => false) }
  end
end

desc "Compile and copy over all extension files"
task :build => ["build:coffee", "build:haml", "build:sass"]

desc "Compile spec CoffeeScripts and setup tests"
task :spec => ["jasmine:compile", "jasmine"]
