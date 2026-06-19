# frozen_string_literal: true

require 'html-proofer'
require 'rspec/core/rake_task'

desc 'Run specs'
RSpec::Core::RakeTask.new do |t|
  t.pattern = 'spec/**/*_spec.rb'
  t.rspec_opts = ['--order', 'rand', '--color']
end

task :test do
  sh 'bundle exec jekyll build'
  Rake::Task['spec'].invoke
  HTMLProofer.check_directory('./_site',
                              check_html: true,
                              enforce_https: true,
                              # Demo-only: don't fail on transient external errors (5xx/timeouts,
                              # e.g. GNU Savannah or joinup.ec.europa.eu rate-limiting CI); real
                              # broken links (4xx) still fail. Not in the PR branch.
                              only_4xx: true,
                              validation: { ignore_script_embeds: true },
                              url_swap: { %r{https://choosealicense\.com} => '',
                                          %r{https://contribulibre\.github\.io} => '' },
                              url_ignore: [%r{https://github.com/[^/]+/[^/]+/edit/[^/]+/_licenses/},
                                           %r{https://help.github.com},
                                           %r{https://opensource.org},
                                           %r{https://git.savannah.gnu.org}],
                              hydra: { max_concurrency: 10 },
                              check_img_http: true).run
end

task :approved_licenses do
  require './spec/spec_helper'
  approved = approved_licenses
  approved.select! { |l| spdx_ids.include?(l) }
  puts "#{approved.count} approved licenses:"
  puts approved.join(', ')
  puts "\n"

  potential = approved - licenses.map { |l| l['id'] }
  puts "#{potential.count} potential additions:"
  puts potential.join(', ')
end
