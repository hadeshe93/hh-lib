export * from './misc';
export * from './stack';
export * from './string';
export * from './promise';

// 导出一些工具类给外界使用
export type TUnpromise<T> = T extends Promise<infer U> ? U : T;
