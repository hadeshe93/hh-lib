/*
 * @Description   : 浏览器信息相关工具文件
 * @usage         : 判断浏览器里面的一些相关信息
 * @Date          : 2022-06-12 19:20:44
 * @Author        : hadeshe
 * @LastEditors   : hadeshe
 * @LastEditTime  : 2022-06-12 21:46:50
 * @FilePath      : /hh-lib/packages/browser/src/browser/index.ts
 */

/**
 * 获取 UA
 * 内部使用
 *
 * @param {string} [rawUA=''] 可以用来兼容 SSR 时传入请求带过来的相关信息
 * @return {*}  {string}
 */
const getUA = (rawUA = ''): string => {
  if (rawUA) return rawUA;
  return typeof navigator === 'undefined' ? rawUA || '' : navigator.userAgent;
};

interface GetMobileTypeMapReturn {
  iPad: boolean;
  iPhone: boolean;
  iPod: boolean;
  android: boolean;
  wp: boolean;
}
/**
 * 获取移动端类型映射
 *
 * @export
 * @param {string} [rawUA='']
 * @return {*}  {GetMobileTypeMapReturn}
 */
export function getMobileTypeMap(rawUA = ''): GetMobileTypeMapReturn {
  const ua = getUA(rawUA);
  const iPad = !!ua.match(/(iPad).*OS\s([\d_]+)/);
  const iPhone = !iPad && !!ua.match(/(iPhone\sOS)\s([\d_]+)/);
  const iPod = !!ua.match(/(iPod).*OS\s([\d_]+)/);
  const android = !!ua.match(/(Android)\s+([\d.]+)/) || !!ua.match(/Android/);
  const wp = !!ua.match(/Windows Phone ([\d.]+)/);
  return {
    iPad,
    iPhone,
    iPod,
    android,
    wp,
  };
}

interface GetMobileOSTypeMapReturn {
  ios: boolean;
  android: boolean;
  wp: boolean;
}
/**
 * 获取移动端操作系统类型
 *
 * @export
 * @param {string} [rawUA='']
 * @return {*}  {GetMobileOSTypeMapReturn}
 */
export function getMobileOSTypeMap(rawUA = ''): GetMobileOSTypeMapReturn {
  const { iPad, iPhone, iPod, android, wp } = getMobileTypeMap(rawUA);
  return {
    ios: iPad || iPhone || iPod,
    android,
    wp,
  };
}

/**
 * 判断是否为移动端
 *
 * @export
 * @param {string} [rawUA='']
 * @return {*}  {boolean}
 */
export function checkIsMobile(rawUA = ''): boolean {
  const { iPad, iPhone, iPod, android, wp } = getMobileTypeMap(rawUA);
  return iPad || iPhone || iPod || wp || android;
}

interface GetMobileOsVersionReturn {
  os: string;
  version: string;
}
/**
 * 获取移动端操作系统版本
 *
 * @export
 * @param {string} [rawUA='']
 * @return {*}  {GetMobileOsVersionReturn}
 */
export function getMobileOsVersion(rawUA = ''): GetMobileOsVersionReturn {
  let tmp;
  let version;
  const ua = getUA(rawUA);
  const map = getMobileOSTypeMap(ua);
  const [os] = Object.entries(map).find((item) => item[1]);

  if (map.ios) {
    tmp = ua && ua.match(/OS\s([\d_.]+)/);
    if (tmp && tmp[1]) {
      version = tmp[1].replace(/_/g, '.');
    }
  } else if (map.android) {
    tmp = ua && ua.match(/Android[\s/]+([\d_.]+)/);
    if (tmp && tmp[1]) {
      version = tmp[1].replace(/_/g, '.');
    }
  }
  return {
    os,
    version,
  };
}

type GetAppTypeMapReturnKey =
  | 'wx'
  | 'qq'
  | 'qzone'
  | 'fm'
  | 'qqmusic'
  | 'ws'
  | 'tencentVideo'
  | 'yyb'
  | 'wb'
  | 'ttpic'
  | 'kg'
  | 'Weiyun'
  | 'QQEGame'
  | 'xinYueClub'
  | 'QNReading'
  | 'tvc'
  | 'QQBrowser';
type GetAppTypeMapReturn = Record<GetAppTypeMapReturnKey, boolean>;
/**
 * 获取当前所处 app 信息映射
 *
 * @export
 * @param {string} [rawUA='']
 * @return {*}  {GetAppTypeMapReturn}
 */
export function getAppTypeMap(rawUA = ''): GetAppTypeMapReturn {
  const ua = getUA(rawUA);
  const isWX = !!ua.match(/MicroMessenger\/([\d.]+)/); // 微信
  const isQQEGame = /\bcom\.tencent\.qgame\/([\d.]+)/.test(ua); // 企鹅电竞
  const isXinYueClub = !!ua.match('tgclub'); // 心悦俱乐部
  const isQQ = !!ua.match(/QQ\/([\d.]+)/); // 手Q
  const isQzone = !!ua.match('Qzone'); // 手空
  const isQQMusic = /QQMUSIC\/(\d[.\d]*)/i.test(ua); // qq音乐
  const isFM = !!ua.match('_FM_'); // 企鹅FM
  const isTencentVideo = !!ua.match('QQLiveBrowser');
  const isWS = !!ua.match('_WEISHI_'); // 微视
  const isYYB = /\/qqdownloader\/(\d+)(?:\/(appdetail|external|sdk))?/.test(ua); // 应用宝
  const isKG = !!ua.match('_KG_'); // K歌
  const isWb = !!ua.match('Weibo'); // weibo
  const isWeiyun = !!ua.match(/Weiyun\/(\d\.)+/); // 微云
  const isPITU = !!ua.match('_PITU_'); // 天天P图，不然就被误认为QQ浏览器了
  const isQNReading = !!ua.match(/qnreading\/([\d.]*)/i);
  const isQQBrowser = !!ua.match('MQQBrowser') && !isQQEGame && !isXinYueClub; // qq浏览器 (QQEGame,xinYueClub ua里面带有MQQBroswer,所以要加这个判断)
  const isTVC = !!ua.match('V1_IPH_TVC'); // 鹅剪
  return {
    wx: isWX,
    qq: isQQ,
    qzone: isQzone,
    fm: isFM,
    qqmusic: isQQMusic,
    ws: isWS,
    tencentVideo: isTencentVideo,
    yyb: isYYB,
    wb: isWb,
    ttpic: isPITU,
    kg: isKG,
    Weiyun: isWeiyun,
    QQEGame: isQQEGame,
    xinYueClub: isXinYueClub,
    QNReading: isQNReading,
    tvc: isTVC,
    // 最后判断 QQBrowser，因为很多 app 的 ua 里都带有 MQQBrowser！！！
    QQBrowser: isQQBrowser,
  };
}
