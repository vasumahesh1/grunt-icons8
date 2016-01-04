/*
 * grunt-icons8
 * https://github.com/vasu/grunt-icons8
 *
 * Copyright (c) 2016 Vasu Mahesh
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var temp = require('temp');
var path = require('path');
var extract = require('extract-zip')

module.exports = function(grunt) {

  var FONT_EXT = ['.eot', '.svg', '.ttf', '.woff'];
  var CSS_EXT = ['.css', '.scss', '.less'];

  var FONT_GLOB = '*(*.eot|*.svg|*.ttf|*.woff)';
  var CSS_GLOB = '*(*.css|*.scss|*.less)';

  grunt.registerMultiTask('icons8', 'Grunt task for Integrating with Icons8', function() {
    var done = this.async();

    var taskData = this.data;

    if (!taskData.archivePath) {
      grunt.log.error('Missing Archive Path.');
      return done('Missing Archive Path.');
    }

    var options = this.options({
      prefix: 'app',
      cssExportPath: './',
      fontExportPath: './',
      fontFilename: null,
      relativeFontPath: null,
      scss: false
    });

    var tempDirectory;
    var fileHash;
    var relativePath = path.relative(options.cssExportPath, options.fontExportPath);

    temp.track();

    temp.mkdir('grunt-icons8', function(err, dirPath) {
      if (err) {
        grunt.log.error('Error creating temporary directory.');
        return done(err);
      }

      tempDirectory = dirPath;
      grunt.log.debug('Writing to Path: ' + tempDirectory);


      // var stream = fs.createReadStream(taskData.archivePath)
      //   .pipe(unzip.Extract({path: tempDirectory}));

      extract(taskData.archivePath, {dir: tempDirectory}, function(err) {
        if (err) {
          grunt.log.error('Error extracting zip to temporary directory.');
          return done(err);
        }

        try {
          var previewHtmlPath = path.join(tempDirectory, 'preview.html');
          fs.unlinkSync(previewHtmlPath);

          var filesToDelete;
          if (options.scss) {
            var cssPath = path.join(tempDirectory, '*.css');
            filesToDelete = grunt.file.expand(cssPath);
            grunt.file.delete(filesToDelete, {force: true}); // Delete from TempDir
          } else {
            var scssPath = path.join(tempDirectory, '*.scss');
            filesToDelete = grunt.file.expand(scssPath);
            grunt.file.delete(filesToDelete, {force: true}); // Delete from TempDir
          }
        } catch (err) {
          grunt.log.warn('Failed to remove some files.', err);
        }

        var isCssFile = function(filename) {
          for (var idx = 0; idx < CSS_EXT.length; idx++) {
            var currentExt = CSS_EXT[idx];
            if (filename.indexOf(currentExt) !== -1) {
              return true;
            }
          }

          return false;
        };

        var isFontFile = function(filename) {
          grunt.log.debug('FontFile Check: ' + filename);
          for (var idx = 0; idx < FONT_EXT.length; idx++) {
            var currentExt = FONT_EXT[idx];
            if (filename.indexOf(currentExt) !== -1) {
              grunt.log.debug('FontFile Check: ' + filename + ' Passed');
              return true;
            }
          }

          grunt.log.debug('FontFile Check: ' + filename + ' Failed');
          return false;
        };

        grunt.file.expand(path.join(tempDirectory, FONT_GLOB)).forEach(function(abspath) {
          if (grunt.file.isFile(abspath)) {
            grunt.log.debug('Processing File: ' + abspath);
            var fileParts = abspath.split('/');
            var filename = fileParts[fileParts.length - 1];

            if (isFontFile(filename)) {

              var fontPath = path.join(options.fontExportPath, filename);

              if (options.fontFilename) {
                var parts = filename.split('.');
                fileHash = parts[0];
                var ext = parts[parts.length - 1];
                fontPath = path.join(options.fontExportPath, options.fontFilename + '.' + ext);
              }

              grunt.file.copy(abspath, fontPath);
            }
          }
        });


        grunt.file.expand(path.join(tempDirectory, CSS_GLOB)).forEach(function(abspath) {
          var content;

          if (grunt.file.isFile(abspath)) {
            grunt.log.debug('Processing File: ' + abspath);
            var fileParts = abspath.split('/');
            var filename = fileParts[fileParts.length - 1];

            if (isCssFile(filename)) {

              content = grunt.file.read(abspath);
              content = content.replace(/icons8/gm, options.prefix);

              if (options.fontFilename) {
                var finalRelativePath = path.join((options.relativeFontPath || relativePath), options.fontFilename);
                var fileReg =  new RegExp('./' + fileHash, 'gm');
                content = content.replace(fileReg, finalRelativePath);
                fileReg =  new RegExp(fileHash, 'gm');
                content = content.replace(fileReg, finalRelativePath);
              }

              grunt.file.write(abspath, content);

              var finalCssPath = path.join(options.cssExportPath, filename);

              grunt.file.copy(abspath, finalCssPath);
            }
          }
        });

        done();
      });

    });
  });

};
