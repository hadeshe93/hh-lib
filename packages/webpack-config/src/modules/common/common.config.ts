import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import AddAssetHtmlPlugin from 'add-asset-html-webpack-plugin';

import { getResolve } from '../../utils/resolver';
import { checkIsEnvDevMode } from '../../utils/env';
import { defaultWebpackPluginHook } from '../../utils/plugin';
import { getAppEntry, getOutputPath, getTemplatePath, getDllPathMap } from '../../core/index';
import type { Plugin, OptionsForGetWebpackConfigs, CustomedWebpackConfigs } from '../../typings/configs';

/**
 * 获取公用配置
 *
 * @export
 * @param {OptionsForGetWebpackConfigs} options
 * @returns webpack 配置
 */
export async function getCommonConfig(options: OptionsForGetWebpackConfigs): Promise<CustomedWebpackConfigs> {
  const resolve = getResolve(options.projectRootPath);
  const isEnvDevMode = checkIsEnvDevMode();
  const styleLoader = isEnvDevMode ? 'style-loader' : MiniCssExtractPlugin.loader;

  const optionsForGetPath = { pageName: options.pageName, resolve };
  const templatePath = getTemplatePath(optionsForGetPath);
  if (!templatePath) {
    throw new Error('请确保存在 index.html 模板');
  }

  const proxyCreatingPlugin = options.proxyCreatingPlugin ?? defaultWebpackPluginHook;

  return {
    mode: options.mode || 'development',
    entry: {
      app: getAppEntry(optionsForGetPath),
    },
    output: {
      path: getOutputPath(optionsForGetPath),
    },
    module: {
      rules: [
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
      ...(isEnvDevMode ? [] : [await proxyCreatingPlugin(MiniCssExtractPlugin, [])]),
      await proxyCreatingPlugin(HtmlWebpackPlugin, [
        {
          filename: 'index.html',
          template: templatePath,
        },
      ]),
      ...(options.dllEntryMap
        ? [
            ...((await [...getDllPathMap(options).values()].map((pathInfo) =>
              proxyCreatingPlugin(webpack.DllReferencePlugin, [
                {
                  manifest: pathInfo.manifestJsonPath,
                },
              ]),
            )) as Plugin[]),
            await proxyCreatingPlugin(AddAssetHtmlPlugin, [
              [...getDllPathMap(options).values()].map((pathInfo) => ({
                publicPath: '../common/',
                outputPath: '../common/',
                filepath: pathInfo.bundleJsPath,
              })),
            ]),
          ]
        : []),
    ],
  };
}