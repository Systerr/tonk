import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// Shared configuration
const sharedConfig = {
  build: {
    sourcemap: true,
    minify: false,
    target: 'esnext',
    rollupOptions: {
      external: ['react', 'zustand'],
      output: {
        manualChunks: {
          automerge: ['@tonk/automerge-repo-fork']
        }
      }
    },
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['@tonk/automerge-repo-fork'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
};

// @ts-ignore - Ignoring type mismatch between Vite versions
export default defineConfig(({ mode }) => {
  if (mode === 'node') {
    return {
      ...sharedConfig,
      build: {
        ...sharedConfig.build,
        lib: {
          entry: resolve(__dirname, 'src/node.ts'),
          name: 'keepsync-node',
          fileName: 'index',
          formats: ['es'],
        },
        outDir: 'dist/node',
        rollupOptions: {
          ...sharedConfig.build.rollupOptions,
          external: [
            'react',
            'zustand',
            'node-fetch',
            'ws',
            'fake-indexeddb',
          ],
        },
      },
      plugins: [dts()],
    };
  }

  // Browser config (default)
  return {
    ...sharedConfig,
    build: {
      ...sharedConfig.build,
      lib: {
        entry: resolve(__dirname, 'src/browser.ts'),
        name: 'keepsync',
        fileName: 'index',
        formats: ['es'],
      },
      outDir: 'dist',
      rollupOptions: {
        ...sharedConfig.build.rollupOptions,
        external: [
          'react',
          'zustand',
          'node-fetch',
          'ws',
          'fake-indexeddb',
          'buffer',
        ],
      },
    },
    plugins: [dts()],
  };
}); 