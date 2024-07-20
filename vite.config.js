import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      base: "/wp-content/uploads/dist/",
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            assetFileNames: '[name].[hash].[ext]', // Evita agregar 'assets' al nombre del archivo
            chunkFileNames: '[name].[hash].js',
            entryFileNames: '[name].[hash].js'
          }
        }
      }
    }
  } else {
    return {
      plugins: [react(), basicSsl()],
    }
  }
});
