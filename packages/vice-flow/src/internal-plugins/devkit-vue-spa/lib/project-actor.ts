import path from 'path';
import { VueConfig, OptionsForRunWebpackConfigHookManager, CustomedWebpackConfigs } from '@hadeshe93/webpack-config';
import { ProjectConfigHelper } from './project-config-helper';
import { doDev, doBuild } from '../../../utils/webpack';

interface ProjectActorCtx {
  vueConfig: VueConfig;
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
    vueConfig: new VueConfig(),
    projectRootPath: '',
    pageName: '',
    projectConfigPath: '',
  };
  projectConfigHelper: ProjectConfigHelper;

  constructor(options: OptionsForProjectActor) {
    const PROJECT_CONFIG_FILE_NAME = 'project.config.js';
    this.ctx.projectRootPath = options.projectRootPath;
    this.ctx.pageName = options.pageName;
    this.ctx.projectConfigPath = path.resolve(options.projectRootPath, PROJECT_CONFIG_FILE_NAME);
    this.projectConfigHelper = new ProjectConfigHelper({
      configFilePath: this.ctx.projectConfigPath,
    });
  }

  async doDev() {
    const webpackDevConfig = await this.runProjectConfigHelper({
      scene: 'dev',
      getDefaultConfig: this.ctx.vueConfig.getDevConfig.bind(this.ctx.vueConfig),
      options: {
        projectRootPath: this.ctx.projectRootPath,
        pageName: this.ctx.pageName,
      },
    });
    console.log('webpackDevConfig: ', JSON.stringify(webpackDevConfig.module.rules));
    return await doDev([webpackDevConfig], 'serial');
  }

  async doBuild() {
    const optionsList: OptionsForRunWebpackConfigHookManager[] = [
      {
        scene: 'build',
        getDefaultConfig: this.ctx.vueConfig.getProdConfig.bind(this.ctx.vueConfig),
        options: {
          projectRootPath: this.ctx.projectRootPath,
          pageName: this.ctx.pageName,
        },
      },
      {
        scene: 'buildDll',
        getDefaultConfig: this.ctx.vueConfig.getProdDllConfig.bind(this.ctx.vueConfig),
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
