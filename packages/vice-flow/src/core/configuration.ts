import { createMemFsCreator } from '../utils/memfs';
import { VICE_FLOW_CONFIGURATION_PATH } from './constants';

import { ViceFlowConfiguration } from '@/typings/core';

const createMemFs = createMemFsCreator();
export class Configuration {
  private fs = createMemFs();

  public data: ViceFlowConfiguration = {
    plugins: [],
  };

  constructor() {
    this.data = this.load();
  }

  // 读取配置
  load(): ViceFlowConfiguration {
    return (
      (this.fs.readJSON(VICE_FLOW_CONFIGURATION_PATH) as unknown as ViceFlowConfiguration) || {
        plugins: [],
      }
    );
  }

  // 保存配置
  async save(): Promise<undefined> {
    this.fs.writeJSON(VICE_FLOW_CONFIGURATION_PATH, this.data);
    return new Promise((resolve, reject) => {
      this.fs.commit((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(undefined);
      });
    });
  }
}

export const configuration = new Configuration();
