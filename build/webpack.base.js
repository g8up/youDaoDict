const path = require('path');
const webpack = require('webpack');

const pkg = require('../package.json');
const app = require('../dist/manifest.json');
const util = require('.//util.js');

const resolve = dir => path.resolve(__dirname, dir);

const banner = `${pkg.name} - v${app.version}
@desc ${app.description}
@author ${pkg.author}
@date ${`${util.getDate()} ${util.getTime()}`}`;

module.exports = {
  entry: {
    background: resolve('../src/background.ts'),
    lookup: resolve('../src/lookup.ts'),
    options: resolve('../src/options.ts'),
  },
  output: {
    path: resolve('../dist/js'),
    filename: '[name].js',
  },
  // devtool: 'source-map',
  // optimization: {
  //   minimize: false
  // },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', 'd.ts'],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner,
      raw: false,
      entryOnly: true,
    }),
  ],
};
