/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { resolve } from 'path';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import manifest from './src/manifest';

const viteManifestHackIssue846: Plugin & {
  renderCrxManifest: (manifest: any, bundle: any) => void;
} = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
    bundle['manifest.json'] = bundle['.vite/manifest.json'];
    bundle['manifest.json'].fileName = 'manifest.json';
    delete bundle['.vite/manifest.json'];
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    viteManifestHackIssue846,
    crx({
      manifest,
      contentScripts: {
        injectCss: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
    },
  },
});
