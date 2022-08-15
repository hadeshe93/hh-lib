import { VueConfig, ReactConfig } from '@hadeshe93/webpack-config';

const MONOREPO_URL = 'github:hadeshe93/webpack5-starter';
export const spaFrameworkConfigMap = {
  vue: {
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3',
    configClass: VueConfig,
  },
  react: {
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react',
    configClass: ReactConfig,
  },
  'vue-element': {
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3-element',
    configClass: VueConfig,
  },
  'react-antd': {
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react-antd',
    configClass: ReactConfig,
  },
};
