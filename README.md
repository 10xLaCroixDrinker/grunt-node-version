# grunt-node-version

[![NPM version](https://badge.fury.io/js/grunt-node-version.png)](https://npmjs.org/package/grunt-node-version "View this project on NPM")
[![Dependency Status](https://gemnasium.com/jking90/grunt-node-version.png)](https://gemnasium.com/jking90/grunt-node-version)
[![Build Status](https://travis-ci.org/jking90/grunt-node-version.png?branch=master)](https://travis-ci.org/jking90/grunt-node-version)
[![Gittip donate button](http://img.shields.io/gittip/jking90.png)](https://www.gittip.com/jking90/ "Donate weekly to this project using Gittip")

> A grunt task to ensure you are using the node version required by your project's package.json

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-node-version --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-node-version');
```

## The "node_version" task

### Overview
In your project's Gruntfile, add a section named `node_version` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  node_version: {
    options: {
      alwaysInstall: false,
      errorLevel: 'fatal',
      globals: [],
      maxBuffer: 200*1024,
      nvm: true,
      override: ''
    }
  }
})
```

Prepend any task lists that contain [grunt-exec](https://github.com/jharding/grunt-exec) tasks with the `node_version` task, and it will extend `grunt-exec` tasks by prepending them with an `nvm use` command when necessary.

### Options

#### options.alwaysInstall
Type: `Boolean`
Default value: `false`

A boolean that determines whether to install the latest compatible version of node without a prompt (default behavior prompts user to install). This is primarily intended to be used for deployment.

#### options.errorLevel
Type: `String`
Default value: `'fatal'`

The level of error given when the wrong node version is being used. Accepted values are `'warn'` and `'fatal'`. Warn can can be overidden with `--force`, fatal cannot.

#### options.globals
Type: `Array`
Default value: `[]`

An array of node modules required to be installed globally for the project.

#### options.maxBuffer
Type: `Number`
Default value: `200*1024`

Specifies the largest amount of data allowed on stdout or stderr - if this value is exceeded then the child process is killed. If using older versions of node or NVM, you may need to increase this number for successful installation.

#### options.nvm
Type: `Boolean`
Default value: `true`

A boolean that determines whether to attempt to use/install a version of node compatible with the project using [NVM](https://github.com/creationix/nvm). If set to `false`, the plugin will just print an error if the wrong node version is being used.

#### options.override
Type: `String`
Default value: `''`

If you want to override the version specified in your project's `package.json`, specify the version you want to use instead here. This is primarily intended for testing projects on other versions of node.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
See [History.md](https://github.com/jking90/grunt-node-version/blob/master/History.md)
