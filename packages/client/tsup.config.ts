import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/**/*.ts'],
  format: ['esm', 'cjs'],
  dts: options.env?.NODE_ENV === 'development',
  tsconfig: './tsconfig.json',
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node24',
  outDir: 'dist',
  watch: options.env?.NODE_ENV === 'development',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
}));
