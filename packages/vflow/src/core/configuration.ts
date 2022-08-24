import { createMemFsCreator } from '../utils/memfs';
import { VICE_FLOW_CONFIGURATION_PATH } from './constants';

import { ViceFlowConfiguration } from '@/types/core';

const createMemFs = createMemFsCreator();
export class Configuration {
  private fs = createMemFs();
  private lastData: ViceFlowConfiguration = {
    plugins: [],
  };
  public data: ViceFlowConfiguration = {
    plugins: [],
  };

  constructor() {
    this.data = this.load();
    this.lastData = JSON.parse(JSON.stringify(this.data));
  }

  // 读取配置
  private load(): ViceFlowConfiguration {
    return (
      (this.fs.readJSON(VICE_FLOW_CONFIGURATION_PATH) as unknown as ViceFlowConfiguration) || {
        plugins: [],
      }
    );
  }

  // 保存配置
  async save(): Promise<undefined> {
    const lastDataSnapshot = JSON.stringify(this.lastData);
    const dataSnapshot = JSON.stringify(this.data);
    if (lastDataSnapshot === dataSnapshot) return;

    this.fs.writeJSON(VICE_FLOW_CONFIGURATION_PATH, this.data);
    await new Promise((resolve, reject) => {
      this.fs.commit((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(undefined);
      });
    });
    this.lastData = JSON.parse(dataSnapshot);
  }
}

export const configuration = new Configuration();
