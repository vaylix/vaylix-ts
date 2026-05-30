import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  tsconfig: './tsconfig.json',
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node24',
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
