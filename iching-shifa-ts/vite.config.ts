import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IchingShifa',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['lunar-javascript'],
      output: {
        globals: {
          'lunar-javascript': 'Lunar',
        },
      },
    },
    minify: false,
    sourcemap: true,
  },
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
});
