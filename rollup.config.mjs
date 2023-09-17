import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig([
  {
    input: ['src/index.ts', 'src/util.ts'],
    output: [
      { dir: 'dist/esm', format: 'esm' },
      { dir: 'dist/lib', format: 'cjs' }
    ],
    plugins: [typescript(), resolve(), commonjs()]
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [resolve(), commonjs(), dts({ respectExternal: true })]
  },
  {
    input: 'src/util.ts',
    output: [{ file: 'dist/util.d.ts', format: 'esm' }],
    plugins: [resolve(), commonjs(), dts({ respectExternal: true })]
  }
]);
