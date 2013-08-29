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

  grunt.registerTask('node_version', 'A grunt task to ensure you are using the node version required by your project\'s package.json', function() {
     
    var expected = grunt.file.readJSON('package.json').engines.node,
        actual = process.version,
        result = semver.satisfies(actual, expected),
        done = this.async(),
        home = process.env.HOME,
        options = this.options({
          alwaysInstall: false,
          copyPackages: false,
          errorLevel: 'fatal',
          extendExec: true,
          globals: [],
          maxBuffer: 200*1024,
          nvm: true,
          nvmPath: home + '/.nvm/nvm.sh'
        }),
        nvmInit = '. ' + options.nvmPath + ' && ',
        cmdOpts = {
          cwd: process.cwd(),
          env: process.env,
          maxBuffer: options.maxBuffer
        };

    // Clean '.x' from expected version
    expected = expected.replace(/(\d+\.\d+)+.x/g,'$1');

    var nvmUse = nvmInit + 'nvm use ' + expected;

    // Extend grunt-exec
    if (options.extendExec && !result) {
      var exec = grunt.config.get('exec');

      for (var key in exec) {
        exec[key].cmd = nvmUse + ' && ' + exec[key].cmd;
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
      grunt.fail.warn('You must define a node verision in your project\'s `package.json` file.\nhttps://npmjs.org/doc/json.html#engines');
    }

    var printVersion = function(using) {
      grunt.log.write('Switched from node ' + actual + ' to ' + using);
      grunt.log.writeln('(Project requires node v' + expected + ')');
    };

    // Check for globally required packages
    var checkPackages = function (packages) {
      var thisPackage;

      if (packages.length) {
        thisPackage = packages.pop();

        var command = nvmUse + ' && npm ls -g ' + thisPackage;

        childProcess.exec(command, cmdOpts,function(err, stdout, stderr) {
          if (err) { throw err ;}

          if (stdout.indexOf('─ (empty)') !== -1) {
            npmInstall(thisPackage, function() {
              checkPackages(packages);        
            });
          } else {
            checkPackages(packages);
          }
        });

      } else {
        done();
      }
    };

    // Install missing packages
    var npmInstall = function(thisPackage, callback) {
      var command = nvmUse + ' && npm install -g ' + thisPackage;

      childProcess.exec(command, cmdOpts,function(err, stdout, stderr) {
        if (err) { throw err ;}
        grunt.verbose.writeln(stdout);
        grunt.log.oklns('Installed ' + thisPackage);
        callback();
      });
    };

    // Prompt to install
    var askInstall = function() {
      prompt.start();

      var prop = {
        name: 'yesno',
        message: 'You do not have any node versions installed that satisfy this project\'s requirements ('.white + expected.yellow + '). Would you like to install the latest compatible version? (y/n)'.white,
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
          grunt[options.errorLevel]('Expected node v' + expected + ', but found ' + actual);
        }
      });
    
    };

    // Install latest compatible node version
    var nvmInstall = function() {
      var command = nvmInit + 'nvm install ' + expected;

      if (options.copyPackages) {
        command += ' && nvm copy-packages ' + actual;
      }

      childProcess.exec(command, cmdOpts,function(err, stdout, stderr) {
        if (err) { throw err ;}
        var nodeVersion = stdout.split(' ')[3];
        grunt.log.ok('Installed node ' + nodeVersion);
        printVersion(nodeVersion);
        checkPackages(options.globals);
      });
    };

    // Check for compatible node version
    var checkVersion = function() {
      childProcess.exec(nvmUse, cmdOpts,function(err, stdout, stderr) {
        // Make sure a node version is intalled that satisfies
        // the projects required engine. If not, prompt to install.
        if (stderr.indexOf('No such file or directory') !== -1) {
          grunt[options.errorLevel]('Expected node v' + expected + ', but found ' + actual + '\nNVM does not appear to be installed.\nPlease install (https://github.com/creationix/nvm#installation), or update the NVM path.');
        } 
        if (stdout.indexOf('N/A version is not installed yet') !== -1) {
          if (options.alwaysInstall) {
            nvmInstall();
          } else {
            askInstall();
          }
        } else {
          printVersion(stdout.split(' ')[3]);
          checkPackages(options.globals);
        }
      });
    };

    if (result === true) {
      checkPackages(options.globals);
    } else {
      if (!options.nvm) {
        grunt[options.errorLevel]('Expected node v' + expected + ', but found ' + actual);
      } else {
        checkVersion();
      }
    }

  });

};
