var pkg = require('./package.json');
var gulp = require('gulp');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');

var banner = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @version v<%= pkg.version %>',
	' * @link <%= pkg.homepage %>',
	' * @author <%= pkg.author %>',
	' */',
	''
].join('\n');

var Asset = {
	js: 'src/*.js',
	less: 'dev/*.less',
	static: [
		'src/*.html',
		'src/*.css',
		'src/*.png',
		'src/*.gif',
		'src/*.json',
	]
};

gulp.task('uglify', function () {
	return gulp
		.src(Asset.js)
		.pipe(uglify())
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('less', function () {
	return gulp.src(Asset.less)
		.pipe(less())
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(gulp.dest('src/'))
		// cssmin
		.pipe(cssmin())
		.pipe(header(banner, {
			pkg: pkg
		}))
		.pipe(gulp.dest('dist/'))
});

gulp.task('copy', function () {
	return gulp
		.src(Asset.static)
		.pipe(gulp.dest('dist/'));
});

gulp.task('watch', function () {
	gulp.watch( Asset.less, ['less']);
});

gulp.task('js', ["uglify"]);
gulp.task('static', ["copy"]);

gulp.task('default', ["js", "less", "static"]);