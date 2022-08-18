/*
 * grunt-node-version
 * https://github.com/10xLaCroixDrinker/grunt-node-version
 *
 * Copyright (c) 2013 Jamie King
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // By default, lint and run the task.
  grunt.registerTask('default', ['jshint', 'node_version']);

};
