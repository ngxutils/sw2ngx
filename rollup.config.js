import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

const libraryName = 'sw2ngx'

export default {
  input: 'src/index.ts',
  output: [
    { file: "dist/sw2ngx.umd.js", name: libraryName, format: 'umd', sourcemap: true },
    { file: "dist/sw2ngx.es5.js", format: 'es', sourcemap: true },
    
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['rimraf', 'request', 'fs'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    typescript({lib: ["es5", "es6", "dom"], target: "es5"}),
    // Allow json resolution
    json(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      browser:false
    })
  ],
}
