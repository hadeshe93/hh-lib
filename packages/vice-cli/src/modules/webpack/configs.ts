import path from 'path';
import glob from 'glob';
import { QuestionCollection } from 'inquirer';
import logger from '../../libs/logger';
import { getProjectRootPath } from './utils';

interface PageInfoItem {
  pageName: string;
}

/**
 * 获取页面信息列表
 *
 * @export
 * @returns 配置列表
 */
function getPageInfoList(): PageInfoItem[] {
  // 先确定当前是在 <projectRoot>/pages/<pageName>/ 下，还是在 <projectRoot>/ 下
  const cwd = process.cwd();
  const projectRootPath = getProjectRootPath();
  if (!projectRootPath) {
    logger.error('你需要位于项目目录 <projectPath>/ 下或者页面目录 src/pages/<pageName>/ 下执行该命令');
    process.exit(1);
  }
  const isInProjectRoot = cwd === projectRootPath;
  if (!isInProjectRoot) {
    return [
      {
        pageName: path.basename(cwd),
      },
    ];
  }
  const pages = glob.sync(path.join(projectRootPath, 'src/pages/*'));
  return pages.map((pagePath) => ({
    pageName: path.basename(pagePath),
  }));
}

/**
 * 获取 prompt 交互问题列表
 *
 * @export
 * @returns 交互问题列表
 */
export function getPromptQuestionsList(): QuestionCollection[] {
  const optionsList = getPageInfoList();
  const getChoice = (optionItem: PageInfoItem) => optionItem.pageName;
  return [
    {
      name: 'pageName',
      message: '请选择目标页面',
      type: 'list',
      choices() {
        return optionsList.map((item) => getChoice(item));
      },
      // filter(input) {
      //   const indexHittedList = optionsList
      //     .map((item) => item.pageName.indexOf(input))
      //     .filter((indexHitted) => indexHitted >= 0)
      //     .sort((a, b) => a - b);
      //   return indexHittedList.map((index) => getChoice(optionsList[index]));
      // },
    },
  ];
}
