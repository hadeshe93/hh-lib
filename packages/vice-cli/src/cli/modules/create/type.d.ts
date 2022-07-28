export interface CreateOptions {
  // 选项名称
  optionName: string;
  // 创建方式
  createType: 'downloadGitRepo' | 'copyLocalProject';
  // 源地址
  sourceUrl: string;
  // 创建方法
  createFunc?: (options: CreateOptions) => Promise<{ isSuccess: boolean; message: string }>;
  // 创建项目出来之后的名称
  appName?: string;
}

export interface CreateReuslt {
  options: CreateOptions;
  isSuccess: boolean;
  message: string;
}
