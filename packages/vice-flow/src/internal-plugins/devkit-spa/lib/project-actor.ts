import path from 'path';
import fsExtra from 'fs-extra';
import {
  WebpackConfiguration,
  VueConfig,
  ReactConfig,
  PAGES_RELATIVE_PATH,
  OptionsForRunWebpackConfigHookManager,
  CustomedWebpackConfigs,
} from '@hadeshe93/webpack-config';
import { OSS_ROOT_DIR } from './constants';
import { ProjectConfigHelper } from './project-config-helper';
import { doDev, doBuild } from '../../../utils/webpack';
import { getAliyunOssOper } from '../../../utils/aliyun-oss';

import type { Logger } from '../../../core/logger';

interface ProjectActorCtx {
  webpackConfiguration: WebpackConfiguration | undefined;
  projectRootPath: string;
  pageName: string;
  projectConfigPath: string;
}

interface OptionsForProjectActor {
  projectRootPath: string;
  pageName: string;
  logger: Logger;
}

interface OptionsForDeploy {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
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
  logger: Logger;

  constructor(options: OptionsForProjectActor) {
    const PROJECT_CONFIG_FILE_NAME = 'project.config.js';
    this.ctx.projectRootPath = options.projectRootPath;
    this.ctx.pageName = options.pageName;
    this.ctx.projectConfigPath = path.resolve(
      options.projectRootPath,
      PAGES_RELATIVE_PATH,
      options.pageName,
      PROJECT_CONFIG_FILE_NAME,
    );
    this.projectConfigHelper = new ProjectConfigHelper({
      configFilePath: this.ctx.projectConfigPath,
    });
    this.initPromise = this.init();
    this.logger = options.logger;
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

  /**
   * 执行开发
   *
   * @returns 构建结果
   * @memberof ProjectActor
   */
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
    // console.log('webpackDevConfig: ', JSON.stringify(webpackDevConfig.module.rules));
    return await doDev([webpackDevConfig], 'serial');
  }

  /**
   * 执行构建
   *
   * @returns 构建结果
   * @memberof ProjectActor
   */
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

  async deploy(options: OptionsForDeploy) {
    await this.initPromise;
    const destDirPath = path.resolve(OSS_ROOT_DIR, path.basename(this.ctx.projectRootPath), this.ctx.pageName);
    const localDirPath = path.resolve(this.ctx.projectRootPath, 'dist');
    if (!(await fsExtra.pathExists(localDirPath))) throw new Error(`Path '${localDirPath}' does not exist.`);

    try {
      const { failedList } = await getAliyunOssOper(options).upload({
        destDirPath,
        localDirPath,
        beforeUpload: async (optionList) => {
          const localFileList = optionList.map(({ localFilePath }) => {
            const seps = localFilePath.split(path.sep);
            const distIndex = seps.indexOf('dist');
            return seps.slice(distIndex).join(path.sep);
          });
          this.logger.log(
            'These files listed below are ready to be uploaded:\r\n',
            JSON.stringify(localFileList, undefined, 2),
          );
          return optionList;
        },
      });
      if (failedList.length === 0) {
        this.logger.success('All files have been deployed successfully~');
      } else {
        this.logger.error('These files listed failed to be deployed.\r\n', JSON.stringify(failedList, undefined, 2));
      }
    } catch (err) {
      this.logger.warn('Exception occurred in deploying:', err);
      process.exit(1);
    }
  }

  async runProjectConfigHelper(options: OptionsForRunWebpackConfigHookManager): Promise<CustomedWebpackConfigs> {
    return await this.projectConfigHelper.run<OptionsForRunWebpackConfigHookManager>(options);
  }
}
