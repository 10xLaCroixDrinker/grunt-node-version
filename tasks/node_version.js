/*
 * grunt-node-version
 * https://github.com/jking90/grunt-node-version
 *
 * Copyright (c) 2013 Jimmy King
 * Licensed under the MIT license.
 */

'use strict';

var semver = require('semver'),
    childProcess = require('child_process');

module.exports = function(grunt) {

  grunt.registerTask('node_version', 'A grunt task to ensure you are using the Node version required by your project\'s package.json', function() {

    var options = this.options({
      errorLevel: 'fatal', // Accepts 'fatal' or 'warn'
      nvm: true
    });

    var expected = grunt.file.readJSON('package.json').engines.node,
        actual = process.version,
        result = semver.satisfies(actual, expected);

    if (expected[expected.length -1] === 'x') {
      expected = expected.split('.');
      expected.pop();
      expected = expected.join('.');
    }

    if (options.errorLevel != 'warn' &&
        options.errorLevel != 'fatal') {
      grunt.fail.warn('Expected node_version.options.errorLevel to be \'warn\' or \'fatal\', but found ' + options.errorLevel);
    }
    
    if (!expected) {
      grunt.fail.warn('You must define a Node verision in your project\'s `package.json` file.\nhttps://npmjs.org/doc/json.html#engines');
    }

    var nvmInstall = function(){
      var command = '. ~/.nvm/nvm.sh && nvm install ' + expected,
          opts = {
            cwd: process.cwd(),
            env: process.env
          };
      
      childProcess.exec(command, opts,function(err, stdout, stderr) {
        if (err) throw err;
        grunt.log.write('Installed Node v' + expected + ' via nvm.');
        nvmUse();
      });
    }

    var nvmUse = function() {
      // Make sure a Node version is intalled that satisfies
      // the projects required engine. If not, prompt to install.
      var command = '. ~/.nvm/nvm.sh && nvm use ' + expected,
          opts = {
            cwd: process.cwd(),
            env: process.env
          };
      
      childProcess.exec(command, opts,function(err, stdout, stderr) {
        if (stdout.indexOf('N/A version is not installed yet') != -1) {
          nvmInstall();
        } else {
          grunt.log.write(stdout);
        }
      });
    };

    if (result === true) {
      return;
    } else {
      if (!options.nvm) {
        grunt.fail[options.errorLevel]('Expected Node v' + expected + ', but found ' + actual);
      } else {
        nvmUse();
      }
    }

  });

};
