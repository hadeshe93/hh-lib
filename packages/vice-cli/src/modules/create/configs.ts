import path from 'path';
import fs from 'fs-extra';
import { QuestionCollection } from 'inquirer';
import { downloadGitRepo } from '@hadeshe93/lib-node';
import { logger } from '../../libs/logger';
import { CreateOptions } from './type';
import { getViceCliTplsUserConfigDir } from '../../configs';

interface CreateFuncReturn {
  isSuccess: boolean;
  message: string;
}

/**
 * 获取配置列表
 *
 * @export
 * @return {*}  {CreateOptions[]}
 */
export function getCreateOptionsList(): CreateOptions[] {
  return [
    {
      optionName: 'webpack5-starter-vue3',
      createType: 'downloadGitRepo',
      sourceUrl: 'github:hadeshe93/webpack5-starter/packages/webpack5-starter-vue3',
      async createFunc(options) {
        return await downloadRepo(options.sourceUrl, options.appName);
      },
    },
    {
      optionName: 'webpack5-starter-vue3-ts',
      createType: 'downloadGitRepo',
      sourceUrl: 'github:hadeshe93/webpack5-starter/packages/webpack5-starter-vue3-ts',
      async createFunc(options) {
        return await downloadRepo(options.sourceUrl, options.appName);
      },
    },
  ];
}

/**
 * 获取 prompt 交互问题列表
 *
 * @export
 * @return {*}  {QuestionCollection[]}
 */
export function getPromptQuestionsList(): QuestionCollection[] {
  return [
    {
      name: 'createOptions',
      message: '请选择要创建的模板类型',
      type: 'list',
      choices() {
        const optionsList = getCreateOptionsList();
        return optionsList.map((item) => ({
          name: item.optionName,
          // 避免被篡改
          value: Object.freeze({ ...item }),
        }));
      },
    },
  ];
}

/**
 * 下载 repo 的应用层封装
 *
 * @param {string} sourceUrl
 * @param {string} appName
 * @return {*}  {Promise<CreateFuncReturn>}
 */
async function downloadRepo(sourceUrl: string, appName: string): Promise<CreateFuncReturn> {
  const sourceUrlSegs = sourceUrl.split('/');
  const repoName = sourceUrlSegs[1];
  const repoFullName = sourceUrlSegs.splice(0, 2).join('/');
  const repoSubPath = sourceUrlSegs.join('/');
  const tempCachePath = path.resolve(getViceCliTplsUserConfigDir(), repoName);
  const dest = path.resolve(process.cwd(), appName);

  // 如果有缓存目录，则删掉
  if (fs.pathExistsSync(tempCachePath)) {
    fs.removeSync(tempCachePath);
  }

  // 检查是否存在指定的项目目录
  if (fs.pathExistsSync(dest)) {
    const message = `创建项目失败，已存在指定文件 ${dest}`;
    logger(message);
    return getFormattedCreateFuncReturnJson({
      isSuccess: false,
      message,
    });
  }

  try {
    await downloadGitRepo(repoFullName, tempCachePath);
    fs.copySync(path.resolve(tempCachePath, repoSubPath || './'), dest);
  } catch (err) {
    const message = err.message;
    return getFormattedCreateFuncReturnJson({
      isSuccess: false,
      message,
    });
  }
  logger('创建项目成功！');
  return getFormattedCreateFuncReturnJson();
}

function getFormattedCreateFuncReturnJson(parmas: any = {}) {
  return {
    isSuccess: parmas?.isSuccess || true,
    message: parmas?.message || '',
  };
}
