'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var minimist = require('minimist');
var imagemin = require('gulp-imagemin');//ѹ��ͼƬ

var options = minimist(process.argv.slice(2));
var vReg = /%version%/g;
var version = options.vs;

gulp.task('css', function () {
    return gulp.src(['app/css/**/*.css'])
        .pipe($.csso())
        .pipe(gulp.dest('./dist/www/css'));
});

gulp.task('js', function() {
    return gulp.src(['app/js/**/*.js'])
        .pipe($.uglify())
        .pipe(gulp.dest('./dist/www/js'));
});

gulp.task('js', function() {
    return gulp.src(['app/i18n/**/*.js'])
        .pipe($.uglify())
        .pipe(gulp.dest('./dist/www/i18n'));
});

//ѹ��ͼƬ
gulp.task('img', function(){
    return gulp.src('app/img/**/*.*')
      .pipe($.imagemin())
      .pipe(gulp.dest('./dist/www/img'));
});

gulp.task('usemin', function () {
    gulp.src('app/*.html')
        .pipe($.usemin({
            js: [ $.uglify ]
        }))
        .pipe($.replace(vReg, version))
        .pipe(gulp.dest('./dist/www/'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', './dist/www']));
gulp.task('build', [ 'js', 'css', 'usemin','img'], function () {
    return gulp.src('./dist/www/**/*').pipe($.size({title: 'build', gzip: true}));
});

/*gulp --vs 1.0.x.x*/
gulp.task('default', ['clean'], function () {
    gulp.start('build');
});