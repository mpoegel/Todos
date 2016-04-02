'use strict';

var childProcess = require('child_process'),
    electron = require('electron-prebuilt'),
    less = require('gulp-less'),
    gulp = require('gulp');

gulp.task('default', ['start', 'less']);

var watcher = gulp.watch('./app/style/**/*.less', ['less']);

gulp.task('start', function() {
  childProcess.spawn(electron, ['./app/main.js'])
    .on('close', function() {
      process.exit()
    });
});

gulp.task('less', function() {
  return gulp.src('./app/style/**/*.less')
    .pipe(less({
      paths: [__dirname + '/app/style']
    }))
    .pipe(gulp.dest('./app/style'));
});
