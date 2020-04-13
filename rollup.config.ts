import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import globals from 'rollup-plugin-node-globals';

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
    globals({
      'rimraf': 'rimraf',
      'fs':'fs',
      'request':'request'
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      browser:false
    }),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}
