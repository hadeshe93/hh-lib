import path from 'path';
import chalk from 'chalk';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

// 枚举类型
const EBuildFormat = {
  cjs: 'cjs',
  esm: 'esm',
  iife: 'iife',
};

// 环境变量
const {
  // 构建目标 package 名
  TARGET: ENV_TARGET,
  // node 环境
  NODE_ENV: ENV_NODE_ENV = 'development',
  // 是否需要 source map
  SOURCE_MAP: ENV_SOURCE_MAP,
} = process.env;

const isEnvProduction = ENV_NODE_ENV === 'production';
// 工具函数
function resolve(p) {
  return path.resolve(packageDir, p);
}

// 项目根目录视角的变量
const packageName = ENV_TARGET;
const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, packageName);

// 包目录视角的变量
const pkg = require(resolve('package.json'));
const pkgName = path.basename(packageDir);
const pkgBuildOptions = pkg.buildOptions || [];

// 输出配置模板
const outputConfigs = {
  cjs: {
    file: resolve(`dist/index.{target}.cjs.js`),
    format: EBuildFormat.cjs,
  },
  esm: {
    file: resolve(`dist/index.{target}.esm.js`),
    format: EBuildFormat.esm,
  },
  iife: {
    file: resolve(`dist/index.{target}.iife.js`),
    format: EBuildFormat.iife,
  },
};
const getOutputConfig = (options = {}) => {
  const { target, name, format } = options || {};
  const config = outputConfigs[format];
  const file = config.file.replace('{target}', target);
  return {
    ...config,
    file,
    name,
  };
};

const defaultFormats = ['cjs', 'esm'];
const packageConfigs = pkgBuildOptions.reduce((allConfigs, buildOptions) => {
  const { target, name, formats = defaultFormats } = buildOptions;
  const configs = (formats || defaultFormats).map((format) => {
    const createFn = (isEnvProduction && format === 'iife')
      ? createConfigWithTerser
      : createConfig;
    return createFn({
      target,
      format,
      outputConfig: getOutputConfig({ target, name, format }),
    });
  });
  return allConfigs.concat(configs);
}, []);

// 创建普通配置
function createConfig(options = {}) {
  const { target, format, outputConfig, plugins = [] } = options || {};
  if (!outputConfig) {
    console.log(chalk.yellow(`invalid format: "${format}"`));
    process.exit(1);
  }
  const output = {
    ...outputConfig,
    exports: 'auto',
    globals: {
      '@hadeshe93/lib-common':
        require(path.resolve(__dirname, 'packages/common/package.json')).buildOptions.name || 'hdsLibCommon',
    },
    sourcemap: ENV_SOURCE_MAP,
  };

  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs'];
  const tsPlugin = ts({
    check: true,
    tsconfig: resolve('tsconfig.json'),
    cacheRoot: path.resolve(__dirname, `.cache/${pkgName}/`),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: true,
        declarationMap: false,
        // override 掉 rootDir
        rootDir: './src',
      },
      exclude: ['**/__tests__', '**/tests'],
    },
  });
  const babelPlugin = babel({
    extensions,
    babelHelpers: format === 'iife' ? 'bundled' : 'runtime',
    presets: [
      [
        '@babel/preset-env',
        {
          modules: format === 'esm' 
            ? false
            : 'auto',
          useBuiltIns: 'usage',
          corejs: 3,
          targets: (() => {
            if (target === 'node') return ['node 12.0'];
            if (target === 'browser') return ['defaults', 'ie 11', 'iOS 10'];
            return ['defaults', 'ie 11', 'iOS 10', 'node 12.0'];
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
      ...(format !== 'iife'
        ? [[
            '@babel/plugin-transform-runtime',
            {
              corejs: 3,
            }
          ]]
        : []),
    ],
  });

  return {
    input: resolve('src/index.ts'),
    output,
    external: format === 'iife'
      ? []
      : [/@babel\/runtime-corejs3/, ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      json({
        namedExports: false,
      }),
      commonjs(),
      nodeResolve({
        extensions,
      }),
      // needBabelPlugin ? babelPlugin : tsPlugin,
      babelPlugin,
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
  const { target, format, outputConfig } = options
  const plugins =  [
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
    target,
    format,
    outputConfig,
    plugins,
  });
}

export default packageConfigs;
