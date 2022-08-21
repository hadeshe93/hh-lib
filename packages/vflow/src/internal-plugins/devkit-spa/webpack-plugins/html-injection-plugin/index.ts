import fs from 'fs-extra';
import path from 'path';
import { Compiler } from 'webpack';
import * as cheerio from 'cheerio';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { generateStringTpl } from '@hadeshe93/lib-common';

export interface HtmlInjectionPluginOptions {
  useFlexible: boolean;
  useDebugger: boolean;
}

// eslint-disable-next-line prettier/prettier, no-useless-escape
const PARTIAL_INJECTION_START_COMMENT = '/*START_INJECTION_CONFIG:${optionName}*/';
// eslint-disable-next-line prettier/prettier, no-useless-escape
const PARTIAL_INJECTION_END_COMMENT = '/*END_INJECTION_CONFIG:${optionName}*/';
const optionNameTpl = generateStringTpl('${optionName}');

export class HtmlInjectionPlugin {
  name = HtmlInjectionPlugin.name;
  useFlexible = true;
  useDebugger = false;

  constructor(options: HtmlInjectionPluginOptions) {
    this.useFlexible = options.useFlexible ?? true;
    this.useDebugger = options.useDebugger ?? false;
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
        data.html = $.html();
        cb(null, data);
      });
    });
  }

  removePresetContent(scriptContent: string, optionName: string) {
    const startComment = optionNameTpl(PARTIAL_INJECTION_START_COMMENT, optionName).replace(/\*/g, '\\*');
    const endComment = optionNameTpl(PARTIAL_INJECTION_END_COMMENT, optionName).replace(/\*/g, '\\*');
    return scriptContent.replace(new RegExp(`${startComment}([\\s\\S]*?)${endComment}`, 'g'), '');
  }
}
