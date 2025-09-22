// /** biome-ignore-all lint:suspicious/noExplicitAny */
// import { produce } from "immer";
// import get from "lodash-es/get";
// import isEqual from "lodash-es/isEqual";
// import set from "lodash-es/set";
// import type { StoreApi } from "zustand";
// import { useStoreWithEqualityFn } from "zustand/traditional";

// type Key = string;
// type Path = string | string[];
// type KeyOrPath = Key | Path | Key[] | Path[];

// // 批量对象 {'a.b.c': val, 'x.y': val2}
// type BatchObject = Record<string, any>;
// // 批量数组 [{path: 'a.b.c', value: val}, ...]
// type BatchArray = Array<{ path: string | string[]; value: any }>;

// interface UseSmartStoreOptions {
//   equalityFn?: (a: any, b: any) => boolean;
// }

// function isPathLike(input: any): boolean {
//   if (Array.isArray(input))
//     return input.length > 0 && typeof input[0] === "string";
//   if (typeof input === "string" && input.includes(".")) return true;
//   return false;
// }
// function pathToArray(path: string | string[]): string[] {
//   return Array.isArray(path) ? path : path.split(".");
// }

// // 1. 基础层 hooks：注入store
// export function useSmartStore<T extends object>(
//   store: StoreApi<T>,
//   options?: UseSmartStoreOptions
// ) {
//   const equalityFn = options?.equalityFn ?? isEqual;
//   const state = useStoreWithEqualityFn(store, (s) => s, equalityFn);

//   function setState(
//     keyOrPath: KeyOrPath | BatchObject | BatchArray,
//     value?: any
//   ) {
//     const isBatchArray =
//       Array.isArray(keyOrPath) &&
//       (keyOrPath as any[]).every(
//         (v) => v && typeof v === "object" && "path" in v
//       );
//     const isBatchObject =
//       typeof keyOrPath === "object" &&
//       !Array.isArray(keyOrPath) &&
//       keyOrPath !== null &&
//       Object.keys(keyOrPath).some((k) => k.includes("."));

//     store.setState((prev: T) => {
//       return produce(prev, (draft: any) => {
//         // 批量 path [{path, value}]
//         if (isBatchArray) {
//           (keyOrPath as BatchArray).forEach(({ path, value }) => {
//             set(draft, pathToArray(path), value);
//           });
//         }
//         // 批量 path {'a.b.c': v, ...}
//         else if (isBatchObject) {
//           Object.entries(keyOrPath as BatchObject).forEach(([path, val]) => {
//             set(draft, pathToArray(path), val);
//           });
//         }
//         // keys/path数组批量
//         else if (Array.isArray(keyOrPath)) {
//           (keyOrPath as (Key | Path)[]).forEach((k, i) => {
//             if (isPathLike(k)) {
//               set(
//                 draft,
//                 pathToArray(k),
//                 Array.isArray(value) ? value[i] : value[k]
//               );
//             } else {
//               draft[k] = Array.isArray(value) ? value[i] : value[k];
//             }
//           });
//         }
//         // path 单项
//         else if (isPathLike(keyOrPath)) {
//           set(draft, pathToArray(keyOrPath as Path), value);
//         }
//         // 单 key
//         else {
//           draft[keyOrPath as Key] = value;
//         }
//       });
//     });
//   }

//   return { state, setState };
// }

// // 2. 通用业务 hooks：传key/path/数组/批量，自动推断类型
// export function useSmartState<T extends object, K extends KeyOrPath>(
//   store: StoreApi<T>,
//   keyOrPath: K,
//   options?: UseSmartStoreOptions
// ): {
//   value: K extends keyof T
//     ? T[K]
//     : K extends (keyof T)[]
//     ? { [P in K[number]]: T[P] }
//     : any;
//   setValue: (
//     value:
//       | (K extends keyof T ? T[K] | ((prev: T[K]) => T[K]) : any)
//       | BatchObject
//       | BatchArray
//   ) => void;
// } {
//   const equalityFn = options?.equalityFn ?? isEqual;

//   // 自动推断类型
//   const selector = (state: T) => {
//     if (Array.isArray(keyOrPath)) {
//       // keys/path数组
//       const picked = {} as any;
//       keyOrPath.forEach((k) =>
//         isPathLike(k) ? (picked[k] = get(state, k)) : (picked[k] = state[k])
//       );
//       return picked;
//     }
//     if (isPathLike(keyOrPath)) {
//       return get(state, keyOrPath);
//     }
//     return state[keyOrPath as keyof T];
//   };
//   const value = useStoreWithEqualityFn(store, selector, equalityFn);

//   // 更新
//   function setValue(valueArg: any) {
//     const isBatchArray =
//       Array.isArray(valueArg) &&
//       (valueArg as any[]).every(
//         (v) => v && typeof v === "object" && "path" in v
//       );
//     const isBatchObject =
//       typeof valueArg === "object" &&
//       !Array.isArray(valueArg) &&
//       valueArg !== null &&
//       Object.keys(valueArg).some((k) => k.includes("."));

//     store.setState((prev: T) => {
//       return produce(prev, (draft: any) => {
//         // 批量 path [{path, value}]
//         if (isBatchArray) {
//           (valueArg as BatchArray).forEach(({ path, value }) => {
//             set(draft, pathToArray(path), value);
//           });
//         }
//         // 批量 path {'a.b.c': v, ...}
//         else if (isBatchObject) {
//           Object.entries(valueArg as BatchObject).forEach(([path, val]) => {
//             set(draft, pathToArray(path), val);
//           });
//         }
//         // keys/path数组批量
//         else if (Array.isArray(keyOrPath)) {
//           keyOrPath.forEach((k, i) => {
//             if (isPathLike(k)) {
//               set(
//                 draft,
//                 pathToArray(k),
//                 Array.isArray(valueArg) ? valueArg[i] : valueArg[k]
//               );
//             } else {
//               draft[k] = Array.isArray(valueArg) ? valueArg[i] : valueArg[k];
//             }
//           });
//         }
//         // path 单项
//         else if (isPathLike(keyOrPath)) {
//           set(draft, pathToArray(keyOrPath as Path), valueArg);
//         }
//         // 单 key
//         else {
//           draft[keyOrPath as Key] = valueArg;
//         }
//       });
//     });
//   }

//   return { value, setValue };
// }
