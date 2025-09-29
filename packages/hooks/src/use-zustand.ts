/** biome-ignore-all lint:suspicious/noExplicitAny> */
import isEqual from "lodash-es/isEqual";
import type { StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  createWithEqualityFn,
  useStoreWithEqualityFn,
} from "zustand/traditional";

/**
 * 自动包裹 immer、devtools、精细比较
 * @param initializer - (set, get) => state
 * @param options - 可选，如 devtools 的 name
 */
export function createStore<T>(
  initializer: StateCreator<T, [["zustand/immer", never]], []>,
  options?: { name?: string }
) {
  // 包裹 immer、devtools
  const store = createWithEqualityFn<T>()(
    devtools(immer(initializer), { name: options?.name }),
    isEqual
  );
  /**
   * 状态选择器函数
   * @template K - 选择器的类型（可以是 key、key数组或函数）
   * @param selector - 选择器参数
   * @returns 根据选择器类型返回相应的状态值
   * - 如果是函数，返回函数的返回值类型
   * - 如果是数组，返回选中的多个状态的对象类型
   * - 如果是单个 key，返回该状态的类型
   */
  function selector<K extends keyof T | (keyof T)[] | ((state: T) => any)>(
    selector: K
  ): K extends (state: T) => infer R
    ? R
    : K extends Array<keyof T> | ReadonlyArray<keyof T>
    ? Pick<T, K[number]>
    : K extends keyof T
    ? Pick<T, K>
    : never {
    return useStoreWithEqualityFn(
      store,
      (state: T) => {
        if (typeof selector === "function") {
          return (selector as (state: T) => any)(state);
        }
        const keys = Array.isArray(selector) ? selector : [selector];
        const picked: Partial<T> = {};
        keys.forEach((k) => {
          picked[k as keyof T] = state[k as keyof T];
        });
        return picked;
      },
      isEqual
    );
  }

  return { store, selector };
}

// 通用的 setter 类型，支持函数式更新
// 支持两种函数签名：
// 1. (state: T) => void - 适用于简单对象
// 2. (state: T, fieldValue: T[K]) => void - 适用于嵌套对象
// 3. (state: T, fieldValue: T[K]) => T[K] - 适用于返回新值的情况
export type SetterFunction<T, K extends keyof T> = (
  nextValue: T[K] | ((state: T, fieldValue: T[K]) => void)
) => void;

/**
 * 创建一个通用的 setter 函数，用于处理 immer 状态更新
 *
 * @template S - 状态对象的类型
 * @template K - 状态对象中的键名，必须是 S 的有效键
 * @param {(fn: (state: S) => void) => void} set - zustand 的 set 函数
 * @param {K} key - 要更新的状态字段名
 * @returns {SetterFunction<S[K]>} 返回一个 setter 函数，可以接受新值或更新函数
 *
 * @example
 * // 基础用法
 * const setCount = createSetter(set, 'count');
 *
 * // 直接设置新值
 * setCount(10);
 *
 * // 使用函数更新简单类型
 * setCount((state) => state.count = state.count + 1);
 *
 * // 使用函数更新嵌套对象
 * setConfig((state, config) => config.theme = 'dark');
 */
export function createSetter<S, K extends keyof S>(
  set: (fn: (state: S) => void) => void,
  key: K
): SetterFunction<S, K> {
  return (nextValue) =>
    set((state) => {
      // 当 nextValue 是函数时，调用它
      // 由于 immer 的特性，我们不需要显式返回新状态
      if (typeof nextValue === "function") {
        // 传递整个 state 和 state[key] 作为参数
        // 这样既支持 (state) => state.a = 4 的形式
        // 也支持 (state, fieldValue) => fieldValue.cc = 5 的形式
        const result = (nextValue as Function)(state, state[key]);
        state[key] = result ?? state[key];
      } else {
        state[key] = nextValue;
      }
    });
}
