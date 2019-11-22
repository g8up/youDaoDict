const path = require('path');
const webpack = require('webpack');
const banner = require('./banner');

const resolve = dir => path.resolve(__dirname, '..', dir);

const {
  DEBUG
} = process.env;

if( DEBUG ) {
  console.log( '调试模式' );
}

module.exports = {
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
    extensions: ['.ts', 'd.ts', '.tsx'],
    alias: {
      '@': resolve('src'),
      Model: resolve('src/model'),
    }
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
        test: /\.(tsx?)$/,
        use: 'ts-loader',
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
