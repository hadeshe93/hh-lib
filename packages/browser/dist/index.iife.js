var hdsLibBrowser = (function (exports) {
  'use strict';

  var index_cjs = {};

  Object.defineProperty(index_cjs, '__esModule', { value: true });

  var EVariabelType;
  (function (EVariabelType) {
      EVariabelType["undefined"] = "undefined";
      EVariabelType["null"] = "null";
      EVariabelType["symbol"] = "symbol";
      EVariabelType["string"] = "string";
      EVariabelType["number"] = "number";
      EVariabelType["boolean"] = "boolean";
      EVariabelType["object"] = "object";
      EVariabelType["array"] = "array";
      EVariabelType["function"] = "function";
      EVariabelType["error"] = "error";
      EVariabelType["regexp"] = "regexp";
      EVariabelType["unknown"] = "unknown";
  })(EVariabelType || (EVariabelType = {}));
  var EVariabelTypeMap;
  (function (EVariabelTypeMap) {
      EVariabelTypeMap["[object Undefined]"] = "undefined";
      EVariabelTypeMap["[object Null]"] = "null";
      EVariabelTypeMap["[object Symbol]"] = "symbol";
      EVariabelTypeMap["[object Number]"] = "number";
      EVariabelTypeMap["[object Boolean]"] = "boolean";
      EVariabelTypeMap["[object String]"] = "string";
      EVariabelTypeMap["[object Object]"] = "object";
      EVariabelTypeMap["[object Array]"] = "array";
      EVariabelTypeMap["[object Function]"] = "function";
      EVariabelTypeMap["[object Error]"] = "error";
      EVariabelTypeMap["[object RegExp]"] = "regexp";
  })(EVariabelTypeMap || (EVariabelTypeMap = {}));
  const getTypeOf = (variable) => {
      const oriType = Object.prototype.toString.call(variable);
      return (EVariabelTypeMap[oriType] || EVariabelType.unknown);
  };

  var index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getTypeOf: getTypeOf
  });

  index_cjs.typeModule = index$1;

  var common = index_cjs;

  /**
   * 插入js脚本
   * @param {string} src 插入js地址
   */
  function insertJs(src = '') {
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

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    insertJs: insertJs
  });

  // 分模块导出，减小包体积
  console.log(common.typeModule.getTypeOf('x'));

  exports.script = index;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
