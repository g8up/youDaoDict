const path = require('path');
const webpack = require('webpack');
const {
  ESBuildMinifyPlugin
} = require('esbuild-loader');
const banner = require('./banner');
const app = require('../dist/manifest.json');

const resolve = dir => path.resolve(__dirname, '..', dir);

module.exports = (env, options) => {
  const isDev = options.mode === 'development';
  console.log(`v${app.version}`);
  console.log(isDev ? '开发模式' : '生产模式');

  return {
    entry: {
      background: resolve('src/background.ts'),
      lookup: resolve('src/lookup.ts'),
      popup: resolve('src/popup.ts'),
      option: resolve('src/option.tsx'),
    },
    output: {
      path: resolve('dist/js'),
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', 'd.ts'],
      alias: {
        '@': resolve('src'),
        Model: resolve('src/model'),
      }
    },
    ...(isDev ? {
      devtool: 'source-map',
      optimization: {
        minimize: false
      },
    } : {
      optimization: {
        minimizer: [new ESBuildMinifyPlugin({
          minify: true,
          sourcemap: false,
          target: 'es2015',
          // banner: `/* ${banner} */`,
        })],
      },
    }),
    module: {
      rules: [{
          test: /\.(tsx?)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: false,
              }
            },
            'less-loader',
          ],
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                url: false,
              }
            },
          ],
        },
        {
          test: /\.less$/,
          use: 'less-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new webpack.BannerPlugin({
        banner,
        raw: false,
        entryOnly: true,
      }),
    ],
  };
};