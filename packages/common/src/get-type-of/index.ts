enum EVariabelType {
  undefined = 'undefined',
  null = 'null',
  symbol = 'symbol',
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  object = 'object',
  array = 'array',
  function = 'function',
  error = 'error',
  regexp = 'regexp',
  unknown = 'unknown',
}

enum EVariabelTypeMap {
  '[object Undefined]' = EVariabelType.undefined,
  '[object Null]' = EVariabelType.null,
  '[object Symbol]' = EVariabelType.symbol,
  '[object Number]' = EVariabelType.number,
  '[object Boolean]' = EVariabelType.boolean,
  '[object Object]' = EVariabelType.object,
  '[object Array]' = EVariabelType.array,
  '[object Function]' = EVariabelType.function,
  '[object Error]' = EVariabelType.error,
  '[object RegExp]' = EVariabelType.regexp,
}

export const getTypeOf = (variable: any): EVariabelType => {
  const oriType = Object.prototype.toString.call(variable);
  return (EVariabelTypeMap[oriType] || EVariabelType.unknown) as EVariabelType;
};