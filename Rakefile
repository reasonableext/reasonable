require "fileutils"
require "yaml"

task :build do
  FileUtils.chdir "src" do
    file_list = YAML::load File.open("yml/chrome.yml")
    file_list.each do |key, value|
      puts key
    end
    FileUtils.copy %w(manifest.json), "../chrome"
  end
end
