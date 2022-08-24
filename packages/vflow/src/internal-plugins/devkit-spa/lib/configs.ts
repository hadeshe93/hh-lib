import { VueConfig, ReactConfig } from '@hadeshe93/webpack-config';
import type { SpaFrameworkType } from '../types/config';

const MONOREPO_URL = 'github:hadeshe93/webpack5-starter';

type SpaFrameworkConfigMap = {
  [key in SpaFrameworkType]: {
    templateName: string;
    repoUrl: string;
    repoTemplatePath: string;
    configClass: typeof VueConfig | typeof ReactConfig;
  };
};

export const spaFrameworkConfigMap: SpaFrameworkConfigMap = {
  vue: {
    templateName: 'webpack5-vue3',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3',
    configClass: VueConfig,
  },
  react: {
    templateName: 'webpack5-react',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react',
    configClass: ReactConfig,
  },
  'vue-element': {
    templateName: 'webpack5-vue3-element',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-vue3-element',
    configClass: VueConfig,
  },
  'react-antd': {
    templateName: 'webpack5-react-antd',
    repoUrl: MONOREPO_URL,
    repoTemplatePath: 'packages/webpack5-react-antd',
    configClass: ReactConfig,
  },
};
