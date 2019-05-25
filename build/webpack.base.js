const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');

const resolve = dir => path.resolve(__dirname, dir);
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
