function getEnvMode() {
  return process.env['NODE_ENV'] || 'development';
}

/**
 * 判断是否为开发环境
 *
 * @export
 * @returns 是否为开发环境
 */
export function checkIsEnvDevMode(): boolean {
  return getEnvMode() === 'development';
}

/**
 * 判断是否为生产环境
 *
 * @export
 * @returns 是否为生产环境
 */
export function checkIsEnvProdMode(): boolean {
  return getEnvMode() === 'production';
}
