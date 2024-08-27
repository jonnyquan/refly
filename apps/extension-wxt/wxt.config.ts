import { ConfigEnv, defineConfig, WxtViteConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import { vitePluginForArco } from '@refly/arco-vite-plugin-react';
import { pluginViteEncoding } from '@refly/plugin-vite-encoding';
import { pluginViteWatcher } from '@refly/plugin-vite-watcher';
import postcssConfig from './postcss.config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { codeInspectorPlugin } from 'code-inspector-plugin';

const getFileAbsolutePath = (fileName: string) => {
  return path.join(__dirname, fileName);
};

// const extraWatchFiles = [
//   getFileAbsolutePath('../../packages/ai-workspace-common/src'),
//   getFileAbsolutePath('./src/entrypoints/'),
// ];

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  vite: (env: ConfigEnv) =>
    ({
      logLevel: 'error',
      plugins: [
        react(),
        tsconfigPaths(),
        pluginViteEncoding({
          filePatterns: ['(.*)?-csui.js'], // optimized only for content scripts ui
        }),
        vitePluginForArco({
          theme: '@arco-themes/react-refly-ai',
          sourceMaps: true,
          filePatterns: ['apps/web/src', 'apps/extension-wxt/src', 'packages/ai-workspace-common/src'],
        }),
        codeInspectorPlugin({
          bundler: 'vite',
        }),
        // pluginViteWatcher({
        //   filesPath: extraWatchFiles,
        // }),
      ],
      css: {
        postcss: postcssConfig,
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@refly-packages/ai-workspace-common': path.resolve(__dirname, '../../packages/ai-workspace-common/src'),
          '@refly/utils': path.resolve(__dirname, '../../packages/utils/src'),
        },
      },
      server: {
        port: 8000,
        fs: {
          strict: false, // TODO：这里需要添加限制，allow 需要处理，目前先临时解决
        },
      },
    }) as WxtViteConfig,
  manifest: {
    version: '0.2.0',
    author: 'pftom',
    name: '__MSG_displayName__',
    description: '__MSG_description__',
    default_locale: 'en',
    host_permissions: ['https://*/*', 'http://*/*', '<all_urls>'],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    commands: {
      _execute_action: {
        suggested_key: { default: 'Ctrl+J', mac: 'Command+J' },
      },
    },
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlkdw0WXN0WT9YYu1nsWezZzSmWrGpny4gK0UhiL7nbz2NQkqq32KsW51Ag3wdvD/ccyS5VUUEnnlAwxmk0CfnO+TNEFM5lCtF+1/2j5HpmlqZMUlu3tUx+SiY3mF6R9cpbfts3IjWomuRVMfHXmWEu3Gctv4T5hSTNKd44Z3SOPj5KeUxYryJmL/y8LR6lj9F/a5Gfblf5t214GKeFXjewgQOmAGT+v5NurIu3xuwPkYqmkrNcRrQHqkdREH4AFp4TjlNpx5W+AR6Qh9FRkGjXTlcVMQ62KqPlIV29Y/VTO/4oUVhPMhVxXH91ojoA7Vzgr76OtnjaysNZbBapxgFQIDAQAB',
    externally_connectable: {
      matches: ['https://refly.ai/*', 'https://api.refly.ai/*', 'https://www.refly.ai/*', 'http://localhost:5173/*'],
    },
    homepage_url: 'https://refly.ai',
    permissions: [
      'storage',
      'scripting',
      'history',
      'activeTab',
      'tabs',
      'unlimitedStorage',
      'cookies',
      'notifications',
      'sidePanel',
    ],
  },
  runner: {
    startUrls: ['https://google.com/'],
    disabled: true,
    chromiumArgs: ['--user-data-dir=./chrome-data'],
  },
});