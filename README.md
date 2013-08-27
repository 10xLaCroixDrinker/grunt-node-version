# grunt-node-version

> A grunt task to ensure you are using the Node version required by your project's package.json

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
      errorLevel: 'fatal',
      extendExec: true,
      nvm: true,
      nvmPath: '~/.nvm/nvm.sh'
    }
  }
})
```

### Options

#### options.errorLevel
Type: `String`
Default value: `'fatal'`

The level of error given when the wrong Node version is being used. Accepted values are `'warn'` and `'fatal'`. Warn can can be overidden with `--force`, fatal cannot.

#### options.extendExec
Type: `Boolean`
Default value: `true`

A boolean that determines if `grunt-node-version` should extend [`grunt-exec`](https://github.com/jharding/grunt-exec).

#### options.nvm
Type: `Boolean`
Default value: `true`

A boolean that determines whether to attempt to use/install a version of Node compatible with the project using [NVM](https://github.com/creationix/nvm). If set to `false`, the plugin will just print an error if the wrong Node version is being used.

#### options.nvmPath
Type: `String`
Default value: `'~/.nvm/nvm.sh'`

A string that represents the path to your NVM install.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0 First release
