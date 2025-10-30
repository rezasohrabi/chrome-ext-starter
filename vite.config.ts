/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import fs from 'fs';
import path, { resolve } from 'path';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';

import manifest from './src/manifest';

function touchFile(filePath: string): void {
  const time = new Date();
  fs.utimesSync(filePath, time, time);
}

type TouchGlobalCSSPluginOptions = {
  cssFilePath: string;
  watchFiles: string[];
};

export function touchGlobalCSSPlugin({
  cssFilePath,
  watchFiles,
}: TouchGlobalCSSPluginOptions): Plugin {
  return {
    name: 'touch-global-css',
    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (watchFiles.some((watchFile) => file.includes(watchFile))) {
          touchFile(cssFilePath);
        }
      });
    },
  };
}

const chromeSpecificManifest = {
  options_page: 'src/options/index.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
};

const firefoxSpecificManifest = {
  options_ui: {
    page: 'src/options/index.html',
    browser_style: false,
  },
  background: {
    scripts: ['src/background/index.ts'],
  },
};

type Mode = 'chrome' | 'firefox';

const generateCrossBrowserManifest = (mode: Mode) => ({
  ...manifest,
  ...(mode === 'firefox' ? firefoxSpecificManifest : chromeSpecificManifest),
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    touchGlobalCSSPlugin({
      cssFilePath: path.resolve(__dirname, 'src/assets/styles/index.css'),
      watchFiles: ['.tsx'],
    }),
    crx({
      manifest: generateCrossBrowserManifest(mode as Mode) as ManifestV3Export,
      browser: mode === 'firefox' ? 'firefox' : 'chrome',
      contentScripts: {
        injectCss: true,
      },
    }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//, /moz-extension:\/\//],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  build: {
    outDir: mode === 'firefox' ? 'dist_firefox' : 'dist_chrome',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.name &&
            /\.(ttf|woff|woff2|eot)$/.test(assetInfo.name)
          ) {
            return 'assets/fonts/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
}));
