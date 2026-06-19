# frozen_string_literal: true

source 'https://rubygems.org'

require 'json'
require 'net/http'
versions = JSON.parse(Net::HTTP.get(URI('https://pages.github.com/versions.json')))

gem 'github-pages', versions['github-pages']

# Internationalization. Not on the GitHub Pages plugin whitelist, so the site is
# built and deployed from GitHub Actions (.github/workflows/deploy.yml) rather than
# by the native Pages build. ~> 1.5 keeps compatibility with the Jekyll version
# pinned by the github-pages gem.
gem 'jekyll-polyglot', '~> 1.5'

# https://github.com/jekyll/jekyll/issues/8523
gem 'webrick', '~> 1.7'

group :development do
  gem 'colored'
  gem 'fuzzy_match'
  gem 'terminal-table'
end

group :test do
  gem 'html-proofer', '~> 3.0'
  gem 'licensee', git: 'https://github.com/licensee/licensee.git', branch: 'master'
  gem 'rake'
  gem 'rspec'
  gem 'rubocop'
end
