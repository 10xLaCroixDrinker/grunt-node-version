/*
 * grunt-node-version
 * https://github.com/jking90/grunt-node-version
 *
 * Copyright (c) 2013 Jimmy King
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('node_version', 'A grunt task to ensure you are using the Node version required by your project's package.json', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      errorLevel: 'fatal',
    });

    var expected = grunt.file.readJSON('package.json').engines.node,
        actual = process.version,
        result = semver.satisfies(actual, expected);
    
    if (result === true) {
      return;
    } else {
      grunt.fail.fatal('Expected Node v' + expected + ', but found ' + actual);
    }

  });

};
