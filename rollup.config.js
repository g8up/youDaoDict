// Rollup plugins
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/background.js',
  dest: 'dist/background.js',
  format: 'iife',
  // sourceMap: 'inline',
  output:{
    globals: {
      chrome: 'chrome',
      JSON: 'JSON',
    },
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs(),
  ],
  watch: {
    chokidar: true,
    include: 'src/**'
  }
};