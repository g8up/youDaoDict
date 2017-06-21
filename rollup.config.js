// Rollup plugins
import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/background.js',
  dest: 'dist/background.js',
  format: 'iife',
  // sourceMap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};