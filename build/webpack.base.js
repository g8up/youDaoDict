const path = require('path');
const webpack = require('webpack');

const pkg = require('../package.json');
const app = require('../dist/manifest.json');
const util = require('./util.js');

const resolve = dir => path.resolve(__dirname, dir);

const banner = `${app.name} - v${app.version}
@desc ${app.description}
@author ${pkg.author}
@date ${`${util.getDate()} ${util.getTime()}`}`;

const {
  DEBUG
} = process.env;

if( DEBUG ) {
  console.log( '调试模式' );
}

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
  ...(DEBUG ? {
    devtool: 'source-map',
    optimization: {
      minimize: false
    },
  }: null),
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
