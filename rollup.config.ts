import resolve from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs";
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import copy from 'rollup-plugin-copy'

const libraryName = 'sw2ngx'

export default {
  input: 'src/index.ts',
  output: [
    { file: "dist/sw2ngx.umd.js", name: libraryName, format: 'umd', sourcemap: true },
    { file: "dist/sw2ngx.es5.js", format: 'es', sourcemap: true },
    
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['rimraf', 'fs', 'node-fetch', 'change-case'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    copy({
      targets: [
        { src: 'src/utils/templates/default/**/*', dest: 'dist/templates/default' }
      ]
    }),
    commonjs(),
    resolve({
      browser:false,
      preferBuiltins: true
    }),
    builtins(),
    json(),
    typescript({ useTsconfigDeclarationDir: true }),
    sourceMaps(),
  ],
}
