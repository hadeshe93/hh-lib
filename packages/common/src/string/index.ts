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
 * @param str 字符串
 * @param length 需要截取的长度
 * @param opts 一些附加指定的配置
 * @returns {IStrInfo}
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
 * @param str 字符串
 * @param len 需要截取的长度
 * @param opts 一些附加指定的配置
 * @returns {string}
 */
export const getLimitedStr = (str: string, len: number, opts?: IGetStrInfoOpts): string =>
  getStrInfoCore(str, len, opts).str;

/**
 * 获取字符串长度
 * @param str 字符串
 * @param opts 一些附加指定的配置
 * @returns {number}
 */
export const getStrLen = (str: string, opts?: IGetStrInfoOpts): number => getStrInfoCore(str, Infinity, opts).count;
