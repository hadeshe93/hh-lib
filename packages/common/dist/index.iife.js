var common = (function (exports) {
  'use strict';

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

  var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getTypeOf: getTypeOf
  });

  exports.getTypeOf = index;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
