export function getBuildEnv() {
  const { NODE_ENV } = process.env;
  return NODE_ENV;
}

export function checkIsDevEnv() {
  return getBuildEnv() === 'development';
}

export function checkIsProdEnv() {
  return getBuildEnv() === 'production';
}
