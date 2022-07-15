import fs from 'fs-extra';
import { VueLoaderPlugin } from 'vue-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { getResolve } from '../utils/resolver';
import { checkIsEnvDevMode } from '../utils/env';
import type { GetConfigOptions, CustomedWebpackConfigs } from '../types/configs';

/**
 * 获取公用配置
 *
 * @export
 * @param {GetConfigOptions} options
 * @returns webpack 配置
 */
export function getCommonConfig(options: GetConfigOptions): CustomedWebpackConfigs {
  const resolve = getResolve(options.projectRootPath);
  const isEnvDevMode = checkIsEnvDevMode();
  const styleLoader = isEnvDevMode ? 'style-loader' : MiniCssExtractPlugin.loader;
  const targetPage = options.pageName || '';
  const appEntryWithoutExt = targetPage ? resolve(`src/pages/${options.pageName}/main`) : 'src/main';
  const appEntryExt = ['.ts', '.js'].find((ext) => fs.pathExistsSync(`${appEntryWithoutExt}${ext}`));

  const publicTemplatePath = resolve('public/index.html');
  const pageTemplatePath = resolve(`src/pages/${options.pageName}/index.html`);
  const templatePath = fs.pathExistsSync(pageTemplatePath) ? pageTemplatePath : publicTemplatePath;
  if (templatePath !== pageTemplatePath && !fs.pathExistsSync(templatePath)) {
    throw new Error(
      '请确保 <projectRootPath>/public/ 下或者 <projectRootPath>/src/pages/<pageName>/ 下存在 index.html 模板',
    );
  }

  return {
    mode: options.mode,
    entry: {
      app: `${appEntryWithoutExt}${appEntryExt}`,
    },
    output: {
      path: resolve(`dist/${targetPage}`),
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
            },
          ],
        },
        {
          test: /\.(j|t)sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                // 启用缓存机制以防止在重新打包未更改的模块时进行二次编译
                cacheDirectory: true,
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'usage',
                      corejs: 3,
                      // 将 ES6 Module 的语法交给 Webpack 本身处理
                      modules: false,
                    },
                  ],
                  [
                    '@babel/preset-typescript',
                    {
                      allExtensions: true,
                    },
                  ],
                ],
                plugins: [['@babel/plugin-transform-runtime', { corejs: 3 }]],
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [styleLoader, 'css-loader'],
        },
        {
          test: /\.scss$/,
          use: [styleLoader, 'css-loader', 'sass-loader'],
        },
        {
          test: /.(png|svg|jpg|jpeg|gif|eot|svg|ttf|woff|woff2)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1024 * 100,
                name: 'assets/images/[name].[hash].[ext]',
                esModule: false,
              },
            },
          ],
          type: 'javascript/auto',
        },
      ],
    },
    resolve: {
      alias: {
        '@': resolve(`src/`),
      },
    },
    plugins: [
      new VueLoaderPlugin(),
      ...(isEnvDevMode ? [] : [new MiniCssExtractPlugin()]),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: templatePath,
      }),
    ],
  };
}
