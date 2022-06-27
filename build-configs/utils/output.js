import { BUILD_FORMATS } from '../constants';

function getOutConfigsMap(pkgResolve) {
  return {
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
  };
}

export function getOutputConfig(options = {}) {
  const { target, pkgResolve, name, format } = options || {};
  // 输出配置模板
  const outputConfigs = getOutConfigsMap(pkgResolve);
  const config = outputConfigs[format];
  const file = config.file.replace('{target}', target);
  return {
    ...config,
    file,
    name,
  };
}
