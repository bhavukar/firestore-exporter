import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/main/main.ts', 'src/main/preload.ts'],
  outDir: 'dist/main',
  format: ['cjs'],
  external: ['electron'],
  noExternal: ['@firestore-exporter/core'],
  clean: false,
  minify: !options.watch,
  sourcemap: false,
  onSuccess: options.watch ? 'node scripts/dev-electron.js' : undefined
}));
