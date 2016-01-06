/*
 * grunt-icons8
 * https://github.com/vasu/grunt-icons8
 *
 * Copyright (c) 2016 Vasu Mahesh
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    icons8: {
      dev: {
        options: {
          cssExportPath: 'output/',
          fontExportPath: 'output/',
          fontFilename: 'myFont',
          // cssFilename: 'fonts',
          scss: false,
          relativeFontPath: '../assets/fonts/typography'
        },
        archivePath: 'test/app.zip'
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },

    release: {
      options: {
        changelog: false,
        add: true,
        commit: true,
        tag: false,
        push: true,
        pushTags: false,
        npm: true,
        npmtag: false,
        commitMessage: '[Grunt Icons8] Release Commit <%= version %>',
        tagMessage: 'Release Build <%= version %>',
        github: {
          repo: 'vasumahesh1/grunt-icons8',
          accessTokenVar: 'GITHUB_ACCESS_TOKEN'
        }
      }
    },
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-release');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'icons8', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
