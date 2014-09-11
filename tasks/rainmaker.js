/*
 * grunt-rainmaker
 *
 * Copyright (c) 2013 David Boskovic
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {


  var crypto  = require('crypto'),
      rest    = require('restler'),
      jade    = require('jade'),
      _       = require('underscore'),
      yaml    = require('js-yaml'),
      path    = require('path');



    var sendToRainmaker = function(f,source,options,ff,cb) {
      var pattern;
      if(f.match(/.+\.jade/)) {
        source = (jade.compile(source, {filename:f.replace('.jade','.lhtml'),pretty:true}))({});
      }
      // console.log(options)
      if(options.local) {
        options.domain = 'http://'+options.client+'.rainmaker.local'
      }
      // console.log(options)
      if(ff.indexOf('patterns') === 0) {
        // console.log(source)
        pattern = yaml.load(source, 'utf8');
        // console.log(options)
        rest.post((options.domain || 'http://'+options.client+'.donate.io')+'/api/3.0/content-patterns', {
          multipart: false,
          username: options.key,
          password: options.secret,
          // username: 'live58',
          // password: 'h1qr8nsm6X6xm2ZU575HbO6mDYBGDL',
          data: {
            'file': ff,
            'config': (JSON.stringify(pattern))
          }
        }).on('complete', function(data) {
          grunt.log.writeln('Pattern ' + ff.cyan + ' saved to server.');
          // console.log(data)
          cb(null,data);
        });

      } else {
        ff = ff.replace('.html','.lhtml').replace('.jade','.lhtml');

        rest.post((options.domain || 'http://'+options.client+'.donate.io')+'/apiv2/themes/'+options.theme+'/files?--suppress-content', {
          multipart: false,
          username: options.key,
          password: options.secret,
          data: {
            'file': ff,
            'content': new Buffer(source).toString('base64')
          }
        }).on('complete', function(data) {
          grunt.log.writeln('Theme File ' + ff.cyan + ' sent to server.');
          cb(null,data);
        });
      }
    }


  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('rainmaker', 'Interact with the RainmakerApp API', function () {

    // Merge task-specific and/or target-specific options with these defaults.
    // var options = this.options({
    //   key: false,
    //   secret: false,
    //   domain:false,
    //   theme:false
    // });


    var options = this.options({
      length: 32,
      hashmap: '.hash',
      changes: '.cache/',
      key: false,
      local: false,
      secret: false,
      client:false,
      theme:'default'
    }),
      hashMap = grunt.file.exists(options.hashmap) ? grunt.file.readJSON(options.hashmap) : {}, // Read the backup hash or empty
      cwd = this.data.cwd,
      tmpHash = {}, // Save current files's hash
      changeList = [],
      flow = [],
      v;


    // Iterate over all specified file groups.
    this.files.forEach(function (f) {
      f.src.filter(function (filepath) { // Ignore dirs
        return !grunt.file.isDir(filepath);
      }).forEach(function (src) {
        var source = grunt.file.read(src, {
          encoding: 'utf8'
        }),
          hash = crypto.createHash('md5').update(source).digest('hex').slice(0, options.length);
        tmpHash[src] = hash;
      });
    });

    // Filter the changes
    _.each(tmpHash,function(item,k){
      if(typeof hashMap[k] === 'undefined' || item !== hashMap[k]) {
        changeList.push(k);
      }
    })
    

    if(changeList.length > 0) {

      // Copy changed files
      changeList.forEach(function (file) {
        // grunt.file.copy(file, options.changes + path.relative(cwd, file));
        // send file to rainmaker
        var source = grunt.file.read(file, {
          encoding: 'utf8'
        })
        flow.push(function(cb){
          sendToRainmaker(file,source,options,path.relative(cwd, file),cb);
        })

        grunt.log.writeln('Detect file ' + file.cyan + ' has been changed.');
      });
      grunt.util.async.series(flow, this.async());
      grunt.file.write(options.hashmap, JSON.stringify(tmpHash));
      grunt.log.writeln('Hashmap ' + options.hashmap.cyan + ' created/updated.');
    } else {
      grunt.log.writeln('No file has been changed, do nothing.');
    }
  });

};