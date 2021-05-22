import path from 'path';
import chalk from 'chalk';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

// 枚举类型
const EBuildFormat = {
  cjs: 'cjs',
  esm: 'esm',
  iife: 'iife'
}

// 环境变量
const {
  // 构建目标 package 名
  TARGET: ENV_TARGET,
  // node 环境
  NODE_ENV: ENV_NODE_ENV = 'development',
  // 是否需要 source map
  SOURCE_MAP: ENV_SOURCE_MAP,
} = process.env;

// 项目根目录视角的变量
const packageName = ENV_TARGET;
const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, packageName);

// 包目录视角的变量
const pkg = require(resolve('package.json'));
const packageOptions = pkg.buildOptions || {};
const name = packageOptions.filename || path.basename(packageDir);

// 输出配置模板
const outputConfigs = {
  cjs: {
    file: resolve(`dist/index.cjs.js`),
    format: EBuildFormat.cjs
  },
  esm: {
    file: resolve(`dist/index.esm.js`),
    format: EBuildFormat.esm
  },
  iife: {
    file: resolve(`dist/index.iife.js`),
    format: EBuildFormat.iife
  },
};
const defaultFormats = ['cjs', 'esm'];
const packageFormats = packageOptions.formats || defaultFormats;
const packageConfigs = packageFormats.map(format => createConfig(format, outputConfigs[format]));

// 工具函数
function resolve(p) {
  return path.resolve(packageDir, p);
};

// 创建配置
function createConfig(format, outputConfig, plugins = []) {
  if (!outputConfig) {
    console.log(chalk.yellow(`invalid format: "${format}"`));
    process.exit(1);
  }
  const output = {
    ...outputConfig,
    name: packageOptions.name,
    exports: 'auto',
    globals: {
      '@hadeshe93/lib-common': 'common'
    },
    sourcemap: ENV_SOURCE_MAP,
  };

  const isProductionBuild = ENV_NODE_ENV === 'production';
  const tsPlugin = ts({
    check: true,
    tsconfig: resolve('tsconfig.json'),
    cacheRoot: path.resolve(__dirname, `.cache/${name}/`),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: true,
        declarationMap: false
      },
      exclude: ['**/__tests__', '**/tests']
    }
  });

  return {
    input: resolve('src/index.ts'),
    output,
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      json({
        namedExports: false
      }),
      tsPlugin,
      ...plugins,
    ],
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  };
};

export default packageConfigs;