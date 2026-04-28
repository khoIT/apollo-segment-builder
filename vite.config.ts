import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { Plugin } from 'vite'

const JOURNEY_SRC = path.resolve(__dirname, '../journey-builder/src')

/**
 * Context-aware @/ resolver:
 * - Files inside journey-builder/src → resolve @/ to journey-builder/src/
 * - All other files             → resolve @/ to liveops-segment-builder/src/
 */
function journeyAliasPlugin(): Plugin {
  return {
    name: 'journey-alias',
    resolveId(source, importer) {
      if (!source.startsWith('@/')) return;
      const base = importer?.includes('/journey-builder/src/')
        ? JOURNEY_SRC
        : path.resolve(__dirname, 'src');
      return this.resolve(path.join(base, source.slice(2)), undefined, { skipSelf: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), journeyAliasPlugin()],
  resolve: {
    alias: {
      '@journey': JOURNEY_SRC,
      /* Force a single copy of React — prevents "Invalid hook call" from duplicate instances */
      'react':            path.resolve(__dirname, 'node_modules/react'),
      'react-dom':        path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime':path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
})
