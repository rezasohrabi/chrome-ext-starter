// eslint-disable-next-line import/no-extraneous-dependencies
import { defineManifest } from '@crxjs/vite-plugin';

import packageData from '../package.json';

const isDev = process.env.NODE_ENV === 'development';

export default defineManifest({
  manifest_version: 3,
  name: `${packageData.displayName || packageData.name}${
    isDev ? ` ➡️ Dev` : ''
  }`,
  version: packageData.version,
  description: packageData.description,
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'icon16.png',
      32: 'icon32.png',
      48: 'icon48.png',
      128: 'icon128.png',
    },
  },
  icons: {
    16: 'icon16.png',
    32: 'icon32.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
  permissions: ['activeTab', 'storage'],
  content_scripts: [
    {
      js: isDev
        ? ['src/content/index.dev.tsx']
        : ['src/content/index.prod.tsx'],
      matches: ['<all_urls>'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', 'public/*'],
      matches: ['<all_urls>'],
    },
  ],
});
