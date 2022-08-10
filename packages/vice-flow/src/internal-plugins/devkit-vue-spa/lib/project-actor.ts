import path from 'path';
import {
  WebpackConfiguration,
  VueConfig,
  ReactConfig,
  OptionsForRunWebpackConfigHookManager,
  CustomedWebpackConfigs,
} from '@hadeshe93/webpack-config';
import { ProjectConfigHelper } from './project-config-helper';
import { doDev, doBuild } from '../../../utils/webpack';

interface ProjectActorCtx {
  webpackConfiguration: WebpackConfiguration | undefined;
  projectRootPath: string;
  pageName: string;
  projectConfigPath: string;
}

interface OptionsForProjectActor {
  projectRootPath: string;
  pageName: string;
}

export class ProjectActor {
  ctx: ProjectActorCtx = {
    pageName: '',
    projectRootPath: '',
    projectConfigPath: '',
    webpackConfiguration: undefined,
  };
  projectConfigHelper: ProjectConfigHelper;
  initPromise: Promise<void> | undefined;

  constructor(options: OptionsForProjectActor) {
    const PROJECT_CONFIG_FILE_NAME = 'project.config.js';
    this.ctx.projectRootPath = options.projectRootPath;
    this.ctx.pageName = options.pageName;
    this.ctx.projectConfigPath = path.resolve(options.projectRootPath, PROJECT_CONFIG_FILE_NAME);
    this.projectConfigHelper = new ProjectConfigHelper({
      configFilePath: this.ctx.projectConfigPath,
    });
    this.initPromise = this.init();
  }

  async init() {
    const transformedConfig = await this.projectConfigHelper.getTransformedConfig();
    const { frameworkType } = transformedConfig.build;
    if (frameworkType === 'vue') {
      this.ctx.webpackConfiguration = new VueConfig();
    } else if (frameworkType === 'react') {
      this.ctx.webpackConfiguration = new ReactConfig();
    }
  }

  async doDev() {
    await this.initPromise;
    const webpackDevConfig = await this.runProjectConfigHelper({
      scene: 'dev',
      getDefaultConfig: this.ctx.webpackConfiguration.getDevConfig.bind(this.ctx.webpackConfiguration),
      options: {
        projectRootPath: this.ctx.projectRootPath,
        pageName: this.ctx.pageName,
      },
    });
    console.log('webpackDevConfig: ', JSON.stringify(webpackDevConfig.module.rules));
    return await doDev([webpackDevConfig], 'serial');
  }

  async doBuild() {
    await this.initPromise;
    const optionsList: OptionsForRunWebpackConfigHookManager[] = [
      {
        scene: 'buildDll',
        getDefaultConfig: this.ctx.webpackConfiguration.getProdDllConfig.bind(this.ctx.webpackConfiguration),
        options: {
          projectRootPath: this.ctx.projectRootPath,
          pageName: this.ctx.pageName,
        },
      },
      {
        scene: 'build',
        getDefaultConfig: this.ctx.webpackConfiguration.getProdConfig.bind(this.ctx.webpackConfiguration),
        options: {
          projectRootPath: this.ctx.projectRootPath,
          pageName: this.ctx.pageName,
        },
      },
    ];
    const webpackConfigs = (
      await Promise.all(optionsList.map((options) => this.runProjectConfigHelper(options)))
    ).filter((config) => !!config);
    return await doBuild(webpackConfigs, 'serial');
  }

  async runProjectConfigHelper(options: OptionsForRunWebpackConfigHookManager): Promise<CustomedWebpackConfigs> {
    return await this.projectConfigHelper.run<OptionsForRunWebpackConfigHookManager>(options);
  }
}
