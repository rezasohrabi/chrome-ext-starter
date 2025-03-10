import { ManifestV3Export } from '@crxjs/vite-plugin';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'Snooze Tab',
  version: '1.0.0',
  description:
    'Temporarily put tabs to sleep and have them reappear when you need them',
  permissions: ['storage', 'tabs', 'alarms', 'notifications', 'contextMenus'],
  action: {
    default_popup: 'popup.html',
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  options_page: 'options.html',
};

export default manifest;
