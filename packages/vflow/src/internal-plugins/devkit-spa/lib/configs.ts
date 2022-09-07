// import type { VueConfig, ReactConfig } from '@hadeshe93/webpack-config';
import type { SpaFrameworkType } from '../types/config';

const MONOREPO_URL = 'github:hadeshe93/webpack5-starter';

type SpaFrameworkConfigMap = {
  [key in SpaFrameworkType]: {
    templateName: string;
    repoUrl: string;
    repoTemplatePath: string;
    getConfigClass: () => any;
  };
};

export const spaFrameworkConfigMap: SpaFrameworkConfigMap = {
  vue: {
    templateName: 'webpack5-vue3',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3',
    getConfigClass: () => require('@hadeshe93/webpack-config').VueConfig,
  },
  react: {
    templateName: 'webpack5-react',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react',
    getConfigClass: () => require('@hadeshe93/webpack-config').ReactConfig,
  },
  'vue-element': {
    templateName: 'webpack5-vue3-element',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3-element',
    getConfigClass: () => require('@hadeshe93/webpack-config').VueConfig,
  },
  'react-antd': {
    templateName: 'webpack5-react-antd',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react-antd',
    getConfigClass: () => require('@hadeshe93/webpack-config').ReactConfig,
  },
};
