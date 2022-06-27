import { VueLoaderPlugin } from 'vue-loader';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { getResolve } from '../utils/resolver';
import { checkIsEnvDevMode } from '../utils/env';
import type { GetConfigOptions, CustomedWebpackConfigs } from '../types/configs';

export function getCommonConfig(options: GetConfigOptions): CustomedWebpackConfigs {
  const resolve = getResolve(options.projectRootPath);
  const isEnvDevMode = checkIsEnvDevMode();
  const styleLoader = isEnvDevMode ? 'style-loader' : MiniCssExtractPlugin.loader;

  return {
    mode: options.mode,
    entry: {
      app: resolve('src/main.js'),
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
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
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
    plugins: [
      new VueLoaderPlugin(),
      ...(isEnvDevMode ? [] : [new MiniCssExtractPlugin()]),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: resolve('public/index.html'),
      }),
    ],
  };
}
