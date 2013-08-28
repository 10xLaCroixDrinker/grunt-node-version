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
          alwaysInstall: false,
          copyPackages: false,
          errorLevel: 'fatal',
          extendExec: true,
          globals: [],
          maxBuffer: 200*1024,
          nvm: true,
          nvmPath: '~/.nvm/nvm.sh'
        }),
        missingGlobals = [],
        nvmInit = '. ' + options.nvmPath + ' && ';

    // Clean expected version
    if (expected[expected.length - 1] === 'x') {
      expected = expected.split('.');
      expected.pop();
      expected = expected.join('.');
    }
  
    var useCommand = nvmInit + 'nvm use ' + expected;

    // Extend grunt-exec
    if (options.extendExec && !result) {
      var exec = grunt.config.get('exec');

      for (var key in exec) {
        exec[key].cmd = useCommand + ' && ' + exec[key].cmd;
      }

      grunt.config.set('exec', exec);
    }

    // Validate options
    if (options.errorLevel !== 'warn' &&
        options.errorLevel !== 'fatal') {
      grunt.fail.warn('Expected node_version.options.errorLevel to be \'warn\' or \'fatal\', but found ' + options.errorLevel);
    }
    
    // Check for engine version in package.json
    if (!expected) {
      grunt.fail.warn('You must define a Node verision in your project\'s `package.json` file.\nhttps://npmjs.org/doc/json.html#engines');
    }

    // Check for globally required packages
    var globalCheck = function() {
      for (var package in options.globals) {
        var command = useCommand,
            opts = {
              cwd: process.cwd(),
              env: process.env,
              maxBuffer: options.maxBuffer
            };

        command += ' && npm ls -g ' + package;

        childProcess.exec(command, opts,function(err, stdout, stderr) {
          if (err) { throw err ;}

          if (stdout.indexOf('(empty)') !== -1) {
            missingGlobals.push(package);
          } else {
            return;
          }
        });
      }

      if (missingGlobals) {
        options.globals = missingGlobals;
        globalInstall();
      } else {
        done();
      }
    }

    // Install missing globals
    var globalInstall = function() {
      var command = useCommand,
          opts = {
            cwd: process.cwd(),
            env: process.env,
            maxBuffer: options.maxBuffer
          };

      for (var package in options.globals) {
        command += ' && npm install -g ' + package;
      }

      childProcess.exec(command, opts,function(err, stdout, stderr) {
        if (err) { throw err ;}
        grunt.log.writeln(stdout);
        done();
      });
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
    
    };

    // Install latest compatible Node version
    var nvmInstall = function() {
      var command = nvmInit + 'nvm install ' + expected,
          opts = {
            cwd: process.cwd(),
            env: process.env,
            maxBuffer: options.maxBuffer
          };

      if (options.copyPackages) {
        command += ' && nvm copy-packages ' + actual;
      }

      childProcess.exec(command, opts,function(err, stdout, stderr) {
        if (err) { throw err ;}
        grunt.log.writeln(stdout);

        if (options.globals) {
          globalInstall();
        } else {
          done();
        }
      });
    };

    // Check for compatible Node version
    var nvmUse = function() {
      var command = useCommand,
          opts = {
            cwd: process.cwd(),
            env: process.env,
            maxBuffer: options.maxBuffer
          };
      
      childProcess.exec(command, opts,function(err, stdout, stderr) {
        // Make sure a Node version is intalled that satisfies
        // the projects required engine. If not, prompt to install.
        if (stderr.indexOf('No such file or directory') !== -1) {
          grunt.fail[options.errorLevel]('Expected Node v' + expected + ', but found ' + actual + '\nNVM does not appear to be installed. Please install (https://github.com/creationix/nvm#installation), or update the NVM path.');
        } 
        if (stdout.indexOf('N/A version is not installed yet') !== -1) {
          if (options.alwaysInstall) {
            nvmInstall();
          } else {
            askInstall();
          }
        } else {
          grunt.log.writeln(stdout);
          if (options.globals) {
            globalCheck();
          } else {
            done();
          }
        }
      });
    };

    if (result === true) {
      if (options.globals) {
        globalCheck();
      } else {
        done();
      }
    } else {
      if (!options.nvm) {
        grunt.fail[options.errorLevel]('Expected Node v' + expected + ', but found ' + actual);
      } else {
        nvmUse();
      }
    }

  });

};
