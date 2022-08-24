export interface ProjectConfigHelperCtx {
  configFilePath: string;
  [key: string]: any;
}

export abstract class BaseProjectConfigHelper<TProjectConfig, TBuilderConfigs> {
  ctx: ProjectConfigHelperCtx = {
    configFilePath: '',
  };
  constructor(options: ProjectConfigHelperCtx) {
    this.ctx.configFilePath = options.configFilePath || '';
  }
  abstract parse(forceRefresh?: boolean): Promise<TProjectConfig>;
  abstract transform(rawProjectConfig: TProjectConfig): Promise<TProjectConfig>;
  abstract generate(transformedConfig: TProjectConfig, options: any): Promise<TBuilderConfigs | undefined>;

  /**
   * 定义统一运行流程
   *
   * @returns 给构建工具使用的配置
   * @memberof BaseProjectConfigHelper
   */
  async run(optionsForGenerate: any): Promise<TBuilderConfigs | undefined> {
    const rawProjectConfigs = await this.parse?.();
    const formattedProjectConfigs = await this.transform?.(rawProjectConfigs);
    const configsForBuilder = await this.generate?.(formattedProjectConfigs, optionsForGenerate);
    return configsForBuilder;
  }
}
