declare enum EVariabelType {
    undefined = "undefined",
    null = "null",
    symbol = "symbol",
    string = "string",
    number = "number",
    boolean = "boolean",
    object = "object",
    array = "array",
    function = "function",
    error = "error",
    regexp = "regexp",
    unknown = "unknown"
}
export declare const getTypeOf: (variable: any) => EVariabelType;
export {};
