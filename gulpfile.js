const path = require('path');
const gulp = require('gulp');
const header = require('gulp-header');
const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const zip = require('gulp-zip');
const del = require('del');

const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const rollupBabel = require('rollup-plugin-babel');
const rollupUglify = require('rollup-plugin-uglify');
const { minify } = require('uglify-es');
const manifest = require('./src/manifest.json');
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
  js: 'src/{background,options,lookup}.js',
  less: 'dev/*.less',
  static: [
    'src/image/*',
    'src/*.html',
    'src/*.css',
    'src/*.json',
  ],
  lib: [
    'src/lib/**',
  ],
};
const Dist = 'dist/';
const Release = 'release/';

const lessIt = () => gulp.src(Asset.less)
  .pipe(less())
  .pipe(cssmin())
  .pipe(header(banner, {
    VERSION,
    pkg,
  }))
  .pipe(gulp.dest(Dist));

// copy static assets
const copy = () => gulp
  .src(Asset.static.concat(Asset.lib), { base: 'src/' })
  .pipe(gulp.dest(Dist));

const zipFile = `${manifest.name}-v${VERSION}.zip`;

const cleanZip = () => del([
  Release + zipFile,
], { dryRun: true });

exports.lessIt = lessIt;
exports.copy = copy;
exports.cleanZip = cleanZip;

const watch = gulp.series(lessIt, copy, () => {
  gulp.watch(Asset.less, lessIt);
  gulp.watch(Asset.static, copy);
});

const getRollupOption = ({ input, dist }) => {
  const jsBanner = `
/**
 * ${manifest.name} - ${pkg.description}
 * @version v${VERSION}
 * @author ${pkg.author}
 * @date ${new Date()}
 */`.trim();
  return {
    read: {
      input,
      output: {
        globals: {
          // chrome: 'chrome'
        },
      },
      plugins: [
        rollupBabel({
          exclude: 'node_modules/**',
          include: 'src/**.js',
        }),
        commonjs(),
        rollupUglify({
          output: {
            preamble: jsBanner,
          },
        }, minify),
      ],
      watch: {
        chokidar: true,
        include: 'src/**',
      },
    },
    write: {
      file: dist,
      format: 'cjs',
      banner: jsBanner,
      // sourcemap: true,
    },
  };
};

const compile = (opt) => {
  const config = getRollupOption(opt);

  rollup.rollup(config.read).then((bundle) => {
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

const rollupIt = (cb) => {
  opts.forEach(compile);
  cb();
};

const rollupWatch = gulp.series(rollupIt, () => {
  gulp.watch('./src/**/*.js', (event) => {
    const dir = event.path;
    const entry = opts.filter(item => path.resolve(item.input) === dir);
    if (entry.length) {
      console.log(entry);
      entry.forEach(compile);
    }
  });
});

gulp.task('js', gulp.series(rollupIt));// build only js
gulp.task('less', gulp.series(lessIt));// build only less
// watcher: js/less/static
gulp.task('dev', gulp.parallel('js', gulp.parallel(watch, rollupWatch)));
// build once
gulp.task('default', gulp.parallel('js', gulp.series('less', copy)));
// only zip files
gulp.task('zip', gulp.series(cleanZip, () => gulp.src(`${Dist}**/*`)
  .pipe(zip(zipFile))
  .pipe(gulp.dest(Release))));
// build + zip
gulp.task('release', gulp.series('default', 'zip'));// 生成发布到 Chrome Web Store 的 zip 文件
