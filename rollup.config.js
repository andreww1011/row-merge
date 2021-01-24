import babel from 'rollup-plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  input: 'dist/row-merge.js',
  output: {
    file: 'dist/row-merge-bundle.js',
    format: 'iife',
    name: "RowMergeBundle",
    globals: {
      jquery: '$'
    },
    sourcemap: true
  },
  external: [
    'jquery'
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    sourcemaps()
  ]
};
