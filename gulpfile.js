var gulp     = require('gulp');
var gutil    = require('gulp-util');
var header   = require('gulp-header');
var uglify   = require('gulp-uglify');
var less     = require('gulp-less');
var cssmin   = require('gulp-cssmin');
var zip      = require('gulp-zip');
var del      = require('del');
var pkg      = require('./package.json');
var manifest = require('./src/manifest.json');

var banner = [
	'/**',
	' * <%= manifest.name %> - <%= manifest.description %>',
	' * @version v<%= manifest.version %>',
	' * @link <%= pkg.homepage %>',
	' * @author <%= pkg.author %>',
	' */',
	''
].join('\n');

var Asset = {
	js: 'src/*.js',
	less: 'dev/*.less',
	static: [
		'src/image/*',
		'src/*.html',
		'src/*.css',
		'src/*.json'
	]
};
var Dist = 'dist/';
var Release = 'release/';
gulp.task('uglify', function () {
	return gulp
		.src(Asset.js)
		.pipe(uglify().on('error', gutil.log))
		.pipe(header(banner, {
			pkg: pkg,
			manifest: manifest
		}))
		.pipe(gulp.dest( Dist ));
});

gulp.task('less', function () {
	return gulp.src(Asset.less)
		.pipe(less())
		.pipe(header(banner, {
			pkg: pkg,
			manifest: manifest
		}))
		.pipe(gulp.dest('src/'))
		.pipe(cssmin())
		.pipe(header(banner, {
			pkg: pkg,
			manifest: manifest
		}))
		.pipe(gulp.dest( Dist ))
});

gulp.task('copy', function () {
	// 关于 base ：http://stackoverflow.com/questions/25038014/how-do-i-copy-directories-recursively-with-gulp#25038015
	return gulp
		.src(Asset.static,{base:'src/'})
		.pipe(gulp.dest( Dist ));
});

gulp.task('clean', function(){
	return del([
			Dist + '**/*'
		]);
});

var zipFile = pkg.name + '-v' + manifest.version + '.zip';
gulp.task('cleanZip', function(){
	return del([
			Release + zipFile
		])
});
gulp.task('zip', ['cleanZip'], function(){
	return gulp.src( Dist + '**/*')
		.pipe(zip(zipFile))
		.pipe( gulp.dest( Release ) );
});

gulp.task('watch', ['less'], function () {
	gulp.watch(Asset.less, ['less']);
	gulp.watch(Asset.js, ['unglify']);
	gulp.watch(Asset.static, ['copy']);
});

gulp.task('static', ["copy"]);

gulp.task('dev', ["watch"]);

gulp.task('default', ["uglify", "less", "static"]);

gulp.task('release', ["default", "zip"]);// 生成发布到 Chrome Web Store 的 zip 文件