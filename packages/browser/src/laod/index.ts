/**
 * 插入 js 脚本
 *
 * @export
 * @param {string} [src=''] js 脚本地址
 * @return {*}  {Promise<any>}
 */
export function insertJs(src = ''): Promise<any> {
  if (typeof src !== 'string' || !src) {
    console.error('Please pass effective src string');
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    let head = document.getElementsByTagName('head')[0];

    tag.type = 'text/javascript';
    tag.src = src;
    tag.addEventListener('load', resolve);
    tag.addEventListener('error', (...args) => {
      head.removeChild(tag);
      head = null;
      reject(...args);
    });

    head.appendChild(tag);
  });
}

/**
 * 插入 css
 *
 * @export
 * @param {string} [src=''] css 文件地址
 * @return {*}  {Promise<any>}
 */
export function insertCss(src = ''): Promise<any> {
  if (typeof src !== 'string' || !src) {
    console.error('Please pass effective src string');
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const tag = document.createElement('link');
    let head = document.getElementsByTagName('head')[0];

    tag.type = 'text/css';
    tag.href = src;
    tag.addEventListener('load', resolve);
    tag.addEventListener('error', (...args) => {
      head.removeChild(tag);
      head = null;
      reject(...args);
    });

    head.appendChild(tag);
  });
}
