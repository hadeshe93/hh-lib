import path from 'path';
import fs from 'fs-extra';
import { resolve as pathResolve } from 'path';
import { getResolve } from '../utils/resolver';
import { generateStringTpl } from '../utils/template';
import type { OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../typings/configs';

export const PAGES_RELATIVE_PATH = 'src/pages';
export const BACKUP_ENTRY_RELATIVE_PATH = 'src/main';
export const PUBLIC_TEMPLATE_RELATIVE_PATH = 'public/index.html';
export const PAGE_ENTRY_RELATIVE_PATH = path.join(PAGES_RELATIVE_PATH, '/${pageName}/main');
export const PAGE_TEMPLATE_RELATIVE_PATH = path.join(PAGES_RELATIVE_PATH, '/${pageName}/index.html');
export const OUTPUT_RELATIVE_PATH = 'dist/${pageName}';

// DLL 相关
export const DLL_OUTPUT_RELATIVE_PATH = 'dist/common';
export const DLL_OUTPUT_MANIFEST_NAME = '[name].mainifest.json';

export type OptionsForGetPath = {
  resolve: (...args: string[]) => string;
  pageName?: string;
};

const pageNameTpl = generateStringTpl('${pageName}');

/**
 * 获取构建入口
 *
 * @export
 * @param {OptionsForGetPath} options
 * @returns 构建入口路径
 */
export function getAppEntry(options: OptionsForGetPath) {
  // 获取构建入口支持的后缀名列表
  const getSupportedAppEntryExtList = () => ['.ts', '.js'];

  // 获取不带后缀名的构建入口路径名称
  const getAppEntryNameWithoutExt = (options: OptionsForGetPath) =>
    options.resolve(
      options.pageName ? pageNameTpl(PAGE_ENTRY_RELATIVE_PATH, options.pageName) : BACKUP_ENTRY_RELATIVE_PATH,
    );

  // 获取入口路径
  const appEntryWithoutExt = getAppEntryNameWithoutExt(options);
  const appEntryExt = getSupportedAppEntryExtList().find((ext) => fs.pathExistsSync(`${appEntryWithoutExt}${ext}`));
  return `${appEntryWithoutExt}${appEntryExt}`;
}

/**
 * 获取构建产物路径
 *
 * @export
 * @param {OptionsForGetPath} options
 * @returns 构建产物路径
 */
export function getOutputPath(options: OptionsForGetPath) {
  return options.resolve(pageNameTpl(OUTPUT_RELATIVE_PATH, options.pageName));
}

/**
 * 获取模板路径
 *
 * @export
 * @param {OptionsForGetPath} options
 * @returns 模板路径
 */
export function getTemplatePath(options: Required<OptionsForGetPath>) {
  const publicTemplatePath = options.resolve(PUBLIC_TEMPLATE_RELATIVE_PATH);
  const pageTemplatePath = options.resolve(pageNameTpl(PAGE_TEMPLATE_RELATIVE_PATH, options.pageName));
  const templatePath = fs.pathExistsSync(pageTemplatePath) ? pageTemplatePath : publicTemplatePath;
  if (templatePath !== pageTemplatePath && !fs.pathExistsSync(templatePath)) {
    return '';
  }
  return templatePath;
}

/**
 * 获取 dll 构建产物路径
 *
 * @export
 * @param {OptionsForGetPath} options 配置参数
 * @returns dll 构建产物的输出目录
 */
export function getProdDllOutputPath(options: OptionsForGetPath) {
  return options.resolve(DLL_OUTPUT_RELATIVE_PATH);
}

/**
 * 获取 dll 构建产物 manifest.json 的路径
 *
 * @export
 * @param {OptionsForGetPath} options
 * @returns dll 构建产物 manifest.json 的路径
 */
export function getProdDllManifestOutputPath(options: OptionsForGetPath) {
  return options.resolve(getProdDllOutputPath(options), DLL_OUTPUT_MANIFEST_NAME);
}

type DllPathMap = Map<
  string,
  {
    manifestJsonPath: string;
    bundleJsPath: string;
  }
>;
/**
 * 获取 dll 文件名与路径的映射 map
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options 配置参数
 * @returns dll 文件名与路径的映射 map
 */
export function getDllPathMap(options: Partial<OptionsForGetWebpackConfigs>): DllPathMap {
  const { dllEntryMap, projectRootPath } = options;
  const resolve = getResolve(projectRootPath);
  const OUTPUT_PATH = getProdDllOutputPath({ resolve });
  const keys = Object.keys(dllEntryMap || {});
  const map = new Map();
  const autoNameTpl = generateStringTpl('[name]');

  for (const key of keys) {
    const manifestJsonPath = autoNameTpl(getProdDllManifestOutputPath({ resolve }), key);
    const manifestJson = require(manifestJsonPath);
    map.set(key, {
      manifestJsonPath: manifestJsonPath,
      bundleJsPath: pathResolve(OUTPUT_PATH, `${manifestJson.name}.js`),
    });
  }
  return map;
}

export abstract class WebpackConfiguration {
  public abstract getDevConfig(): Promise<CustomedWebpackConfigs>;
  public abstract getProdConfig(): Promise<CustomedWebpackConfigs>;
  public abstract getProdDllConfig(): Promise<CustomedWebpackConfigs>;
}
