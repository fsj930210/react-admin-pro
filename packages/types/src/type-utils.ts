/** biome-ignore-all lint:suspicious/noExplicitAny */

// 提取函数的第一个参数类型
export type FirstParameter<T extends (...args: any[]) => any> =
  Parameters<T>[0];

// 提取函数除第一个参数外的剩余参数类型
export type RestParameters<T extends (...args: any[]) => any> =
  Parameters<T> extends [infer _First, ...infer Rest] ? Rest : [];
