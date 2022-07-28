export function generateStringTpl(pattern: string | RegExp) {
  return (str: string, val = '') => str.replace(pattern, val || '');
}
