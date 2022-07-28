import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import webpack, { Compiler } from 'webpack';
import { generateStringTpl } from '@hadeshe93/lib-common';
import {
  getResolve,
  getDllFilePathMap,
  getProdDllOutputPath,
  DLL_OUTPUT_MANIFEST_NAME,
} from '@hadeshe93/webpack-config';
import { getDllEntryMap } from '../../../../utils/vice-config-helpers';

import type { ViceConfigs } from '../../../../types/vice-configs';
import type { CustomedWebpackConfigHooksPlugin } from '@hadeshe93/webpack-config';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import AddAssetHtmlPlugin from 'add-asset-html-webpack-plugin';

interface OptionsForGetInternalPlugin {
  projectRootPath: string;
  viceConfigs: ViceConfigs;
}
export function getInternalWebpackConfigHooksPlugin(
  options: OptionsForGetInternalPlugin,
): CustomedWebpackConfigHooksPlugin {
  const { projectRootPath, viceConfigs } = options;
  let scene = '';
  return {
    pluginName: 'InternalWebpackConfigHooksPlugin',
    hooks: {
      async start({ scene: rawScene }) {
        scene = rawScene;
      },
      async beforeNewPlugin(options) {
        if (scene === 'buildDll') return options;

        if (options.pluginClass.name === 'HtmlWebpackPlugin') {
          const [pluginOpts] = options.args;
          const { title = '', description = '' } = viceConfigs.page || {};
          pluginOpts.title = title || '';
          pluginOpts.description = description || '';
        }
        return options;
      },
      async plugins(plugins) {
        if (scene === 'build') {
          plugins.push(
            new HtmlInjectionPlugin({
              useDebugger: viceConfigs.page.useDebugger,
              useFlexible: viceConfigs.page.useFlexible,
            }),
          );

          const resolve = getResolve(projectRootPath);
          const dllEntryMap = getDllEntryMap(viceConfigs);

          // 如果有配置 dllEntryMap
          if (dllEntryMap) {
            const dllOutputPath = getProdDllOutputPath({ resolve });
            const dllFilePathMap = getDllFilePathMap({ projectRootPath, dllEntryMap });
            const dllPluginInsList = [...dllFilePathMap.keys()].map(
              (key) =>
                new webpack.DllReferencePlugin({
                  manifest: path.resolve(dllOutputPath, DLL_OUTPUT_MANIFEST_NAME.replace('[name]', key)),
                }),
            );
            const DLL_ASSETS_RELATIVE_PATH = '../common/';
            const addAssetHtmlPlugin = new AddAssetHtmlPlugin(
              [...dllFilePathMap.values()].map((filepath) => ({
                publicPath: DLL_ASSETS_RELATIVE_PATH,
                outputPath: DLL_ASSETS_RELATIVE_PATH,
                filepath,
              })),
            );
            plugins.push(...dllPluginInsList, addAssetHtmlPlugin);
          }
        }
        return plugins;
      },
    },
  };
}

// eslint-disable-next-line prettier/prettier, no-useless-escape
const PARTIAL_INJECTION_START_COMMENT = '/*START_VICE_CONFIG:${optionName}*/';
// eslint-disable-next-line prettier/prettier, no-useless-escape
const PARTIAL_INJECTION_END_COMMENT = '/*END_VICE_CONFIG:${optionName}*/';
const optionNameTpl = generateStringTpl('${optionName}');
interface HtmlInjectionPluginOptions {
  useFlexible: boolean;
  useDebugger: boolean;
}
class HtmlInjectionPlugin {
  name = HtmlInjectionPlugin.name;
  useFlexible = true;
  useDebugger = false;

  constructor(options: HtmlInjectionPluginOptions) {
    this.useFlexible = options.useFlexible || true;
    this.useDebugger = options.useDebugger || false;
  }

  removePresetContent(scriptContent: string, optionName: string) {
    const startComment = optionNameTpl(PARTIAL_INJECTION_START_COMMENT, optionName);
    const endComment = optionNameTpl(PARTIAL_INJECTION_END_COMMENT, optionName);
    return scriptContent.replace(new RegExp(`${startComment}([\\s\\S]*?)${endComment}`, 'g'), '');
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(this.name, async (data, cb) => {
        const $ = cheerio.load(data.html);
        let scriptContent = fs.readFileSync(path.resolve(__dirname, './partial-scripts.js'), 'utf-8') as string;
        if (!this.useFlexible) {
          scriptContent = this.removePresetContent(scriptContent, 'useFlexible');
        }
        if (!this.useDebugger) {
          scriptContent = this.removePresetContent(scriptContent, 'useDebugger');
        }
        $('head').append(`<script>${scriptContent}</script>`);
        cb(null, data);
      });
    });
  }
}
