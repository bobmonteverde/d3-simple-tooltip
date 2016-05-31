import babel from 'rollup-plugin-babel'

export default {
  entry: 'index.js',
  format: 'umd',
  moduleName: 'd3_simple_tooltip',
  plugins: [ babel() ],
  dest: 'build/d3-simple-tooltip.js'
}
