/**
 * 插入js脚本
 * @param {string} src 插入js地址
 */
 export function insertJs(src: string = '') {
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
