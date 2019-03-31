const gulp = require('gulp');
const header = require('gulp-header');
const less = require('gulp-less');
const cleanCss = require('gulp-clean-css');
const zip = require('gulp-zip');
const del = require('del');

const manifest = require('./dist/manifest.json');
const pkg = require('./package.json');

const VERSION = manifest.version;
const banner = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= VERSION %>',
  ' * @author <%= pkg.author %>',
  ' * @date <%= new Date() %>',
  ' */',
  '',
].join('\n');

const Asset = {
  less: 'src/style/*.less',
  static: [
    'src/*.css',
  ],
};
const Dist = 'dist/';
const Release = 'release/';

const lessIt = () => gulp.src(Asset.less)
  .pipe(less())
  .pipe(cleanCss())
  .pipe(header(banner, {
    VERSION,
    pkg,
  }))
  .pipe(gulp.dest(Dist));

// copy static assets
const copy = () => gulp
  .src(Asset.static, { base: 'src/' })
  .pipe(gulp.dest(Dist));

const zipFile = `${manifest.name}-v${VERSION}.zip`;

const cleanZip = () => del([
  Release + zipFile,
], { dryRun: true });


const watch = gulp.series(lessIt, copy, () => {
  gulp.watch(Asset.less, lessIt);
  gulp.watch(Asset.static, copy);
});

gulp.task('less', gulp.series(lessIt));// build only less
// watcher: less/static
gulp.task('watch', gulp.series(watch));
// build once
gulp.task('static', gulp.series('less', copy));
// only zip files
gulp.task('zip', gulp.series(cleanZip, () => gulp.src(`${Dist}**/*`)
  .pipe(zip(zipFile))
  .pipe(gulp.dest(Release))));
// build + zip
gulp.task('release', gulp.series('static', 'zip'));// 生成发布到 Chrome Web Store 的 zip 文件
