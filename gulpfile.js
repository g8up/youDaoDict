var pkg    = require('./package.json');
var gulp   = require('gulp');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var less   = require('gulp-less');
var cssmin = require('gulp-cssmin');

var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author %>',
  ' */',
  ''].join('\n');

gulp.task('uglify', function () {
  return gulp
    .src('src/*.js')
    .pipe( uglify() )
    .pipe( header( banner, { pkg: pkg} ) )
    .pipe(gulp.dest('dist/'))
  ;
});

gulp.task('less', function () {
  return gulp.src('dev/*.less')
    .pipe(less())
    .pipe( header( banner, { pkg: pkg} ) )
    .pipe(gulp.dest('src/'))
    // cssmin
    .pipe(cssmin())
    .pipe( header( banner, { pkg: pkg} ) )
    .pipe(gulp.dest('dist/'))
});

gulp.task('copy', function () {
  return gulp
    .src([
      'src/*.html',
      'src/*.png',
      'src/*.gif',
      'src/*.json',
      ])
    .pipe(gulp.dest('dist/'))
  ;
});

gulp.task('js', ["uglify"]);
gulp.task('css', ["less"]);
gulp.task('html', ["copy"]);

gulp.task('default', ["js", "css", "html"]);