/*
 * grunt-node-version
 * https://github.com/jking90/grunt-node-version
 *
 * Copyright (c) 2013 Jimmy King
 * Licensed under the MIT license.
 */

'use strict';

var semver = require('semver'),
    prompt = require('prompt'),
    childProcess = require('child_process');

module.exports = function(grunt) {

  grunt.registerTask('node_version', 'A grunt task to ensure you are using the Node version required by your project\'s package.json', function() {
     
    var expected = grunt.file.readJSON('package.json').engines.node,
        actual = process.version,
        result = semver.satisfies(actual, expected),
        done = this.async(),
        options = this.options({
          errorLevel: 'fatal',
          extendExec: true,
          nvm: true,
          nvmPath: '~/.nvm/nvm.sh',
          alwaysInstall: false
        });

    // Clean expected version
    if (expected[expected.length - 1] === 'x') {
      expected = expected.split('.');
      expected.pop();
      expected = expected.join('.');
    }
  
    var useCommand = 'source ' + options.nvmPath + ' && nvm use ' + expected;

    // Extend grunt-exec
    if (options.extendExec) {
      var exec = grunt.config.get('exec');

      for (var key in exec) {
        exec[key].cmd = useCommand + ' && ' + exec[key].cmd;
      }

      grunt.config.set('exec', exec);
    }

    // Validate options
    if (options.errorLevel != 'warn' &&
        options.errorLevel != 'fatal') {
      grunt.fail.warn('Expected node_version.options.errorLevel to be \'warn\' or \'fatal\', but found ' + options.errorLevel);
    }
    
    // Check for engine version in package.json
    if (!expected) {
      grunt.fail.warn('You must define a Node verision in your project\'s `package.json` file.\nhttps://npmjs.org/doc/json.html#engines');
    }

    // Prompt to install
    var askInstall = function() {
      prompt.start();

      var prop = {
        name: 'yesno',
        message: 'You do not have any Node versions installed that satisfy this project\'s requirements ('.white + expected.yellow + '). Would you like to install the latest compatible version? (y/n)'.white,
        validator: /y[es]*|n[o]?/,
        required: true,
        warning: 'Must respond yes or no'
      };

      prompt.get(prop, function (err, result) {
        result = result.yesno.toLowerCase();
        if (result === 'yes' ||
            result === 'y') {
          nvmInstall();
        } else {
          grunt.fail[options.errorLevel]('Expected Node v' + expected + ', but found ' + actual);
        }
      });
    
    }

    // Install latest compatible Node version
    var nvmInstall = function() {
      var command = 'source ' + options.nvmPath + ' && nvm install ' + expected,
          opts = {
            cwd: process.cwd(),
            env: process.env
          };

      childProcess.exec(command, opts,function(err, stdout, stderr) {
        if (err) throw err;
        grunt.log.writeln(stdout)
        done();
      });
    }

    // Check for compatible Node version
    var nvmUse = function() {
      var command = useCommand,
          opts = {
            cwd: process.cwd(),
            env: process.env
          };
      
      childProcess.exec(command, opts,function(err, stdout, stderr) {
        // Make sure a Node version is intalled that satisfies
        // the projects required engine. If not, prompt to install.
        if (stdout.indexOf('N/A version is not installed yet') != -1) {
          if (options.alwaysInstall) {
            nvmInstall();
          } else {
            askInstall();
          }
        } else {
          grunt.log.writeln(stdout);
          done();
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
