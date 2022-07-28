import path from 'path';
import fs from 'fs-extra';
import { BUILD_FORMATS, DEFAULT_INPUT_RELATIVE_PATH } from '../constants';

/**
 * 获取预置的构建 output 的 map 配置
 *
 * @param {*} pkgResolve
 * @returns 不同构建格式的 output 配置
 */
function getOutConfigsMap(pkgResolve) {
  return {
    // ============ 适用于构建 npm 包场景 START ============
    cjs: {
      file: pkgResolve(`dist/{fileName}.{target}.cjs.js`),
      format: BUILD_FORMATS.CJS,
    },
    esm: {
      file: pkgResolve(`dist/{fileName}.{target}.esm.js`),
      format: BUILD_FORMATS.ESM,
    },
    iife: {
      file: pkgResolve(`dist/{fileName}.{target}.iife.js`),
      format: BUILD_FORMATS.IIFE,
    },
    // ============ 适用于构建 npm 包场景 END ============

    // ============ 适用于构建脚手架场景 START ============
    // 生成 cjs 格式 bin 文件所用的的配置
    cjsBin: {
      file: pkgResolve(`bin/{fileName}.cjs.js`),
      format: BUILD_FORMATS.CJS,
    },
    // 生成 esm 格式 bin 文件所用的的配置
    esmBin: {
      file: pkgResolve(`bin/{fileName}.esm.js`),
      format: BUILD_FORMATS.ESM,
    },
    // ============ 适用于构建脚手架场景 END ============
  };
}

/**
 * 获取构建用的 output 配置
 *
 * @export
 * @param {*} [options={}]
 * @returns 构建用的 output 配置
 */
export function getOutputConfig(options = {}) {
  const { target, pkgResolve, format, name } = options || {};
  // 输出配置模板
  const outputConfigs = getOutConfigsMap(pkgResolve);
  const config = outputConfigs[format];

  const input = getInputConfig(options);
  const { name: fileName } = path.parse(input);
  const file = config.file.replace('{target}', target).replace('{fileName}', fileName);
  return {
    ...config,
    file,
    name,
  };
}

/**
 * 获取构建用的输入配置
 *
 * @export
 * @param {*} [options={}]
 * @returns 构建入口路径
 */
export function getInputConfig(options = {}) {
  const { input: rawInput, pkgResolve } = options || {};
  // 默认入口
  let input = pkgResolve(DEFAULT_INPUT_RELATIVE_PATH);
  if (rawInput && typeof rawInput === 'string') {
    // 兼容绝对路径和相对路径
    input = path.isAbsolute(rawInput) ? rawInput : pkgResolve(rawInput);
  }
  if (!fs.pathExistsSync(input)) {
    console.error(`构建入口 ${input} 不存在，无法进行构建`);
    process.exit(1);
  }
  // console.log('[getInputConfig] input: ', input);
  return input;
}
