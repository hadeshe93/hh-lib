/*
 * @Description   : 字符串操作相关文件
 * @usage         :
 * @Date          : 2022-02-23 10:48:24
 * @Author        : hadeshe93<hadeshe93@gmail.com>
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-07-23 17:54:17
 * @FilePath      : /hh-lib/packages/common/src/string.ts
 */
import emoutils from 'emoutils';

interface IGetStrInfoOpts {
  // 中文汉字当几个计算
  zhCharCnt: number;
  // emoji 当几个计算
  emojiCnt: number;
}

interface IStrInfo {
  count: number;
  str: string;
}

const DFT_GET_LIMITED_STR_OPTS = {
  zhCharCnt: 1,
  emojiCnt: 1,
};

// 除 BMP 之外的 16 个辅助平面上的字符集合
const REGX_ASTRAL_SYMBOLS = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
// 0x0001-0x007e ASCII 码，0xff60-0xff9f 日本片假名字符集
const REGX_COMMON_SYMBOLS = /[\u01-\u007E]|[\uFF60-\uFF9F]/g;

/**
 * 获取字符串的相关信息
 *
 * @param str 字符串
 * @param length 需要截取的长度
 * @param opts 一些附加指定的配置
 * @returns 字符串的相关信息
 */
export const getStrInfoCore = (str: string, length: number, opts?: IGetStrInfoOpts): IStrInfo => {
  const options = {
    ...DFT_GET_LIMITED_STR_OPTS,
    ...(opts || {}),
  };
  options.zhCharCnt = options.zhCharCnt <= 0 ? 1 : options.zhCharCnt;
  options.emojiCnt = options.emojiCnt <= 0 ? 1 : options.emojiCnt;

  const len = isNaN(parseInt(String(length), 10)) || length <= 0 ? Infinity : length;
  const { zhCharCnt, emojiCnt } = options;
  let retStr = '';
  let count = 0;

  if (zhCharCnt === 1 && emojiCnt === 1)
    return {
      count: emoutils.length(str),
      str: emoutils.substr(str, 0, len),
    };

  const strArr = emoutils.toArray(str);
  strArr.forEach((char) => {
    const isEmoji = emoutils.isEmoji(char);
    if (isEmoji && emojiCnt > 1) {
      count += emojiCnt;
    } else {
      const isNormalChar = REGX_COMMON_SYMBOLS.test(char);
      const isAstralChar = REGX_ASTRAL_SYMBOLS.test(char);
      if (isAstralChar && !isNormalChar && zhCharCnt > 1) {
        count += zhCharCnt;
      } else {
        count += 1;
      }
    }
    if (count <= len) retStr = `${retStr}${char}`;
  });
  return {
    count,
    str: retStr,
  };
};

/**
 * 截取字符串
 *
 * @param str 字符串
 * @param len 需要截取的长度
 * @param opts 一些附加指定的配置
 * @returns 截取后的字符串
 */
export const getLimitedStr = (str: string, len: number, opts?: IGetStrInfoOpts): string =>
  getStrInfoCore(str, len, opts).str;

/**
 * 获取字符串长度
 *
 * @param str 字符串
 * @param opts 一些附加指定的配置
 * @returns 字符串长度
 */
export const getStrLen = (str: string, opts?: IGetStrInfoOpts): number => getStrInfoCore(str, Infinity, opts).count;

/**
 * 过滤字符串中的零宽字符
 *
 * @param str 原始字符串
 * @returns 过滤后的字符串
 */
export const filterZeroWidthCharsOfString = (str: string): string => {
  // 参考： https://juejin.cn/post/6844904164057677831
  const filteredStr = str.replace(/[\u200b-\u200f\uFEFF\u202a-\u202e]/g, '');
  return filteredStr;
};

/**
 * 编码 xss 相关的字符
 *
 * @export
 * @param {string} str
 * @returns 编码后的字符串
 */
export function encodeXssCharacters(str: string): string {
  return `${str}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\x60/g, '&#96;')
    .replace(/\x27/g, '&#39;')
    .replace(/\x22/g, '&quot;');
}

/**
 * 解码 xss 相关的字符
 *
 * @export
 * @param {string} str
 * @returns 解码后的字符串
 */
export function decodeXssCharacters(str: string): string {
  return `${str}`
    .replace(/&quot;/g, '\x22')
    .replace(/&#0*39;/g, '\x27')
    .replace(/&#0*96;/g, '\x60')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

/**
 * kebab-case 转 camelCase
 *
 * @export
 * @param {string} str
 * @returns 转换命名格式后的字符串
 */
export function camelize(str: string): string {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}

/**
 * 生成字符串模板替换的方法
 *
 * @export
 * @param {(string | RegExp)} pattern
 * @returns 字符串模板替换的方法
 */
export function generateStringTpl(pattern: string | RegExp) {
  return (str: string, val = '') => str.replace(pattern, val || '');
}
