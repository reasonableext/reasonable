require "coffee-script"
require "fileutils"
require "haml"
require "RedCloth"
require "sass"

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
  opts = { :top_level => false }.merge(opts)
  output_dir = opts[:top_level] ? "" : output_type

  puts "#{input_type} => #{output_type}"
  Dir[File.join(SOURCE_DIR, input_type, "*.#{input_type}")].each do |path|
    output_name   = "#{File.basename(path, ".*")}.#{output_type}"
    output_path   = File.join(EXTENSION_DIR, output_dir, output_name)
    relative_path = File.join(output_dir, output_name).sub(/^\//, "")

    File.open(output_path, "w") do |handle|
      puts "  #{relative_path}"
      handle.puts yield(File.read(path))
    end
  end
end

namespace :build do
  desc "Compile CoffeeScript to JavaScript"
  task :coffee do |t|
    compile_sources("coffee", "js") { |c| CoffeeScript.compile(c) }
  end

  desc "Compile HAML to HTML"
  task :haml do |t|
    compile_sources("haml", "html", :top_level => true) { |c| Haml::Engine.new(c).render }
  end

  desc "Compile SASS to CSS"
  task :sass do |t|
    compile_sources("sass", "css") { |c| Sass::Engine.new(c).render }
  end
end

desc "Compile everything"
task :build => ["build:coffee", "build:haml", "build:sass"]
