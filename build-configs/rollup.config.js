import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

import { checkIsDevEnv } from './utils/env';
import { getInputConfig, getOutputConfig } from './utils/in-out';
import { BUILD_FORMATS } from './constants';
import { getPkgResolve } from './utils/resolver';
import { rollupPluginDelete } from './plugins/rollup-plugin-delete';

// 环境变量
const {
  // 构建目标 package 名
  TARGET: ENV_TARGET,
  // 是否需要 source map
  SOURCE_MAP: ENV_SOURCE_MAP,
} = process.env;

const isEnvProduction = checkIsDevEnv();

// 项目根目录视角的变量
const packageName = ENV_TARGET;
const pkgResolve = getPkgResolve(packageName);

// 包目录视角的变量
const pkg = require(pkgResolve('package.json'));
const pkgBuildOptions = pkg.buildOptions || [];

const defaultFormats = [BUILD_FORMATS.CJS, BUILD_FORMATS.ESM];
const packageConfigs = pkgBuildOptions.reduce((allConfigs, buildOptions) => {
  const { input: rawInput, target, name, formats = defaultFormats, declaration = true } = buildOptions;
  const input = getInputConfig({ input: rawInput, pkgResolve });
  const configs = (formats || defaultFormats).map((format) => {
    const createFn = isEnvProduction && format === BUILD_FORMATS.IIFE ? createConfigWithTerser : createConfig;
    return createFn({
      input,
      target,
      format,
      outputConfig: getOutputConfig({ input, target, pkgResolve, name, format }),
    });
  });
  // 默认会生成声明文件，如果不需要，可以通过 buildOptions.declaration 进行关闭
  if (declaration) {
    const { name } = path.parse(input);
    const REDUNDANT_FILE_PATH = pkgResolve(`dist/__empty_tsc_declaration_${name}__.js`);
    configs.push(
      createDeclarationConfig({
        input,
        target,
        outputConfig: {
          file: REDUNDANT_FILE_PATH,
        },
        plugins: [
          rollupPluginDelete({
            post: {
              globPattern: REDUNDANT_FILE_PATH,
            },
          }),
        ],
      }),
    );
  }
  return allConfigs.concat(configs);
}, []);

// 创建普通配置
function createConfig(options = {}) {
  const { input, target, format, outputConfig, plugins = [] } = options || {};
  if (!outputConfig) {
    console.log(chalk.yellow(`invalid format: "${format}"`));
    process.exit(1);
  }
  const output = {
    ...outputConfig,
    exports: 'auto',
    sourcemap: ENV_SOURCE_MAP,
  };

  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs'];
  const babelPlugin = babel({
    extensions,
    babelHelpers: format === 'iife' ? 'bundled' : 'runtime',
    presets: [
      [
        '@babel/preset-env',
        {
          modules: format === BUILD_FORMATS.ESM ? false : 'auto',
          useBuiltIns: 'usage',
          corejs: 3,
          targets: (() => {
            if (target === 'node') return ['node >= 12.0'];
            if (target === 'browser') return ['defaults', 'ie 11', 'iOS >= 10'];
            return ['defaults', 'ie 11', 'iOS >= 10', 'node >= 12.0'];
          })(),
        },
      ],
      [
        '@babel/preset-typescript',
        {
          allExtensions: true,
        },
      ],
    ],
    plugins: [
      ...(format !== BUILD_FORMATS.IIFE
        ? [
            [
              '@babel/plugin-transform-runtime',
              {
                corejs: 3,
              },
            ],
          ]
        : []),
    ],
  });

  if (!fs.pathExistsSync(input)) {
    console.error(`构建入口 ${input} 不存在，无法进行构建`);
    process.exit(1);
  }
  return {
    input,
    output,
    // /@babel\/runtime-corejs3/ 加入 external 很重要，需要仔细阅读：
    // https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
    external:
      format === BUILD_FORMATS.IIFE
        ? []
        : [
            /@babel\/runtime-corejs3/,
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
          ],
    plugins: [
      json({
        namedExports: false,
      }),
      commonjs(),
      nodeResolve({
        extensions,
      }),
      babelPlugin,
      // 2022.06.25 官方已合并代码，但是还未发版
      // - feat: support emitDeclarationOnly #366: https://github.com/ezolenko/rollup-plugin-typescript2/pull/366
      // tsPlugin,
      ...plugins,
    ],
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
  };
}

// 在普通配置基础上，创建压缩配置
function createConfigWithTerser(options) {
  const { input, target, format, outputConfig } = options;
  const plugins = [
    terser({
      ecma: 5,
      module: /^esm/.test(format),
      compress: {
        pure_getters: true,
      },
      safari10: true,
    }),
  ];
  return createConfig({
    input,
    target,
    format,
    outputConfig,
    plugins,
  });
}

// 创建编译出 d.ts 声明文件的配置
function createDeclarationConfig(options = {}) {
  const { format, outputConfig, plugins = [] } = options || {};
  if (!outputConfig) {
    console.log(chalk.yellow(`invalid format: "${format}"`));
    process.exit(1);
  }
  const output = {
    ...outputConfig,
    exports: 'auto',
    sourcemap: ENV_SOURCE_MAP,
  };

  const extensions = ['.ts', '.tsx', 'd.ts', '.js', '.jsx', '.json', '.mjs'];
  // eslint-disable-next-line no-unused-vars
  const tsPlugin = ts({
    check: true,
    tsconfig: pkgResolve('tsconfig.json'),
    cacheRoot: pkgResolve(`.ts-cache/`),
    tsconfigOverride: {
      compilerOptions: {
        emitDeclarationOnly: true,
        sourceMap: output.sourcemap,
        declaration: true,
        declarationMap: true,
        // override 掉 rootDir
        rootDir: './src',
      },
      exclude: ['**/__tests__', '**/tests'],
    },
  });

  return {
    input: pkgResolve('src/index.ts'),
    output,
    plugins: [
      json({
        namedExports: false,
      }),
      commonjs(),
      nodeResolve({
        extensions,
      }),
      tsPlugin,
      ...(plugins || []),
    ],
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
  };
}

export default packageConfigs;
