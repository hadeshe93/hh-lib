export * from './types/vice-configs';
export { run } from './cli/index';

// 这块还要再斟酌下，到底是放到 vice-cli 里面还是 vice 里面
// 核心问题是 vice 和 cli 到底是否需要拆开？各有什么好处？业界是怎么做的？
// export * from 'vue';
