const { defineConfig } = require('vite');
const { resolve } = require('path');
const { svelte } = require('@sveltejs/vite-plugin-svelte');

module.exports = defineConfig({
  plugins: [svelte()],
  rollupDedupe: ['svelte'],
  root: 'src/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),
    },
  },
});
