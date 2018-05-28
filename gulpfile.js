var path = require('path');
var pkg = require('./package.json');
var manifest = require('./src/manifest.json');
var gulp = require('gulp');
var header = require('gulp-header');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var zip = require('gulp-zip');
var del = require('del');

const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const rollupBabel = require('rollup-plugin-babel');
const rollupUglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');

const VERSION = manifest.version
var banner = [
	'/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @version v<%= VERSION %>',
	' * @author <%= pkg.author %>',
	' */',
	''
].join('\n');

var Asset = {
	js: 'src/{background,options,lookup}.js',
	less: 'dev/*.less',
	static: [
		'src/image/*',
		'src/*.html',
		'src/*.css',
		'src/*.json',
	],
	lib:[
		'src/lib/**',
	],
};
var Dist = 'dist/';
var Release = 'release/';

var lessIt = function () {
	return gulp.src(Asset.less)
		.pipe(less())
		.pipe(cssmin())
		.pipe(header(banner, {
			VERSION,
			pkg: pkg
		}))
		.pipe(gulp.dest(Dist))
};

// copy static assets
var copy = function () {
	// 关于 base ：http://stackoverflow.com/questions/25038014/how-do-i-copy-directories-recursively-with-gulp#25038015
	return gulp
		.src(Asset.static.concat(Asset.lib ), { base: 'src/' })
		.pipe(gulp.dest(Dist));
};

var clean = function (cb) {
	del([
		Dist + '**/*'
	]);
	cb();
};

var zipFile = pkg.name + '-v' + VERSION + '.zip';

var cleanZip = function () {
	return del([
		Release + zipFile
	])
};

exports.lessIt = lessIt;
exports.copy = copy;
exports.clean = clean;
exports.cleanZip = cleanZip;

var zip = gulp.series(cleanZip, function () {
	return gulp.src(Dist + '**/*')
		.pipe(zip(zipFile))
		.pipe(gulp.dest(Release));
});

var watch = gulp.series(lessIt, copy, function () {
	gulp.watch(Asset.less, lessIt);
	gulp.watch(Asset.static, copy);
});

const getRollupOption = ({ input, dist }) => {
	let banner = `
/**
 * ${ manifest.name } - ${ pkg.description }
 * @version v${ VERSION }
 * @author ${ pkg.author }
 */`.trim();
	return {
		read: {
			input: input,
			// sourceMap: 'inline',
			output:{
				globals: {
					// chrome: 'chrome'
				},
			},
			plugins: [
				rollupBabel({
					exclude: 'node_modules/**',
					include: 'src/**.js'
				}),
				commonjs(),
				rollupUglify({
					output:{
						preamble: banner,
					},
				}, minify),
			],
			watch: {
				chokidar: true,
				include: 'src/**'
			}
		},
		write: {
			file: dist,
			format: 'cjs',
			banner,
		}
	}
};

const compile = (opt) => {
	const config = getRollupOption(opt);

	rollup.rollup(config.read).then(bundle => {
		bundle.write(config.write);
	}, (err) => {
		console.log(err);
	}).catch(err => console.log(err));
};

const opts = [{
	input: 'src/background.js',
	dist: 'dist/background.js',
}, {
	input: 'src/options.js',
	dist: 'dist/options.js',
}, {
	input: 'src/lookup.js',
	dist: 'dist/lookup.js',
},
];

var rollupIt = function (cb) {
	opts.forEach(compile);
	cb();
};

var rollupW = gulp.series(rollupIt, function () {
	gulp.watch('./src/**/*.js', function (event) {
		const dir = event.path;
		const entry = opts.filter(item => {
			return path.resolve(item.input) === dir;
		});
		if (entry.length) {
			console.log(entry);
			entry.forEach(compile);
		}
	});
});

gulp.task('dev', gulp.parallel(watch, rollupW));
gulp.task('default', gulp.parallel(rollupIt, gulp.series(lessIt, copy, rollupIt)));
gulp.task('release', gulp.series("default", zip));// 生成发布到 Chrome Web Store 的 zip 文件