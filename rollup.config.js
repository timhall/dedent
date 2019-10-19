import dts from 'rollup-plugin-dts';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';

// I Love You

export default [
  {
    input: 'src/index.ts',
    output: {
      format: 'es',
      file: 'dist/dedent.es.js',
      sourcemap: true
    },
    plugins: [typescript(), filesize()]
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      file: 'dist/dedent.js',
      name: 'dedent',
      sourcemap: true
    },
    plugins: [typescript(), filesize()]
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'umd',
      file: 'dist/dedent.min.js',
      name: 'dedent',
      sourcemap: true
    },
    plugins: [typescript(), terser(), filesize()]
  },
  {
    input: 'src/macro.ts',
    output: {
      format: 'cjs',
      file: 'dist/macro.js',
      sourcemap: true
    },
    external: ['@babel/types', 'babel-plugin-macros'],
    plugins: [typescript(), filesize()]
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'es',
      file: 'dist/dedent.d.ts'
    },
    plugins: [dts()]
  }
];
