function getEnvMode() {
  return process.env['NODE_ENV'];
}

export function checkIsEnvDevMode() {
  return getEnvMode() === 'development';
}

export function checkIsEnvProdMode() {
  return getEnvMode() === 'production';
}
