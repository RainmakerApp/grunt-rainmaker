# grunt-rainmaker

> Interact with the RainmakerApp API

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-rainmaker --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-rainmaker');
```

## The "rainmaker" task

### Overview
In your project's Gruntfile, add a section named `rainmaker` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  rainmaker: {
    options: {
      // domain:'http://sandbox.rainmaker.local',
      key: '<%= config.momentum.key %>',
      secret: '<%= config.momentum.secret %>',
      client: '<%= config.momentum.client %>'
    },
    files: {
      expand: true,
      cwd:'theme',
      src: ['**/*.{jade,html,lhtml,htm,xhtml}']
    }

  }
})
```

### Options

#### options.key
Type: `String`
Default value: `''`

Your Momentum/Rainmaker API Key

#### options.secret
Type: `String`
Default value: `''`

Your Momentum/Rainmaker API Secret

#### options.client
Type: `String`
Default value: `''`

Your Momentum/Rainmaker API Client ID

## Release History
_(Nothing yet)_
