import { BUILD_FORMATS } from '../constants';

function getOutConfigsMap(pkgResolve) {
  return {
    // ============ 适用于构建 npm 包场景 START ============
    cjs: {
      file: pkgResolve(`dist/index.{target}.cjs.js`),
      format: BUILD_FORMATS.CJS,
    },
    esm: {
      file: pkgResolve(`dist/index.{target}.esm.js`),
      format: BUILD_FORMATS.ESM,
    },
    iife: {
      file: pkgResolve(`dist/index.{target}.iife.js`),
      format: BUILD_FORMATS.IIFE,
    },
    // ============ 适用于构建 npm 包场景 END ============

    // ============ 适用于构建脚手架场景 START ============
    // 生成 cjs 格式 bin 文件所用的的配置
    cjsBin: {
      file: pkgResolve(`bin/{name}.cjs.js`),
      format: BUILD_FORMATS.CJS,
    },
    // 生成 esm 格式 bin 文件所用的的配置
    esmBin: {
      file: pkgResolve(`bin/{name}.esm.js`),
      format: BUILD_FORMATS.ESM,
    },
    // ============ 适用于构建脚手架场景 END ============
  };
}

export function getOutputConfig(options = {}) {
  const { target, pkgResolve, name, format } = options || {};
  // 输出配置模板
  const outputConfigs = getOutConfigsMap(pkgResolve);
  const config = outputConfigs[format];
  const file = config.file.replace('{target}', target).replace('{name}', name);
  return {
    ...config,
    file,
    name,
  };
}
