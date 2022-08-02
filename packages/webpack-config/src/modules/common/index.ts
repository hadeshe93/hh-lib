import { WebpackConfiguration } from '../../core/index';
import { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../../typings/configs';
import { getCommonConfig } from './common.config';
import { getDevConfig } from './dev.config';
import { getProdConfig } from './prod.config';
import { getProdDllConfig } from './prod.dll.config';

export class CommonConfig extends WebpackConfiguration {
  options: OptionsForGetWebpackConfigs = {
    projectRootPath: process.cwd(),
    pageName: '',
  };

  constructor(options?: OptionsForGetWebpackConfigs) {
    super();
    if (options) {
      this.options = options;
    }
  }

  public async getCommonConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    return getCommonConfig(options);
  }

  public async getDevConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    return getDevConfig(options);
  }

  public async getProdConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    return getProdConfig(options);
  }

  public async getProdDllConfig(options?: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
    if (!options) {
      options = this.options;
    }
    return getProdDllConfig(options);
  }
}
