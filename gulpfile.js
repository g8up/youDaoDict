const gulp = require('gulp');
const header = require('gulp-header');
const less = require('gulp-less');
const cleanCss = require('gulp-clean-css');
const zip = require('gulp-zip');
const del = require('del');
const banner = require('./build/banner');

// 取自 webpack/lib/BannerPlugins.js
const wrapComment = str => `/*!\n * ${str
  .replace(/\*\//g, '* /')
  .split('\n')
  .join('\n * ')}\n */`;

const {
  name,
  version,
} = require('./dist/manifest');

const Asset = {
  less: [
    'src/style/*.less',
    '!src/style/common.less',
  ],
};

const Dist = 'dist/';
const Release = 'release/';

const less2css = () => gulp.src(Asset.less)
  .pipe(less())
  .pipe(cleanCss())
  .pipe(header(wrapComment(banner)))
  .pipe(gulp.dest(`${Dist}/style`));

const zipFile = `${name}-v${version}.zip`;

const cleanZip = () => del([
  Release + zipFile,
], { dryRun: true });


const watch = gulp.series(less2css, () => {
  gulp.watch(Asset.less, less2css);
});

gulp.task('css', less2css);// build only less
// watcher: less/static
gulp.task('watch', watch);
// only zip files
gulp.task('zip', gulp.series(cleanZip, () => gulp.src(`${Dist}**/*`)
  .pipe(zip(zipFile))
  .pipe(gulp.dest(Release))));
// build + zip
gulp.task('release', gulp.series('css', 'zip'));// 生成发布到 Chrome Web Store 的 zip 文件
