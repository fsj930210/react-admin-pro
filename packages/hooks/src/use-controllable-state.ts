import { isFunction } from "@rap/utils";
import { useRef } from "react";
import type { SetStateAction } from "react";
import { useMemoizedFn } from "./use-memoized-fn";
import { useUpdate } from "./use-update";

export interface Options<T> {
  defaultValue?: T;
  defaultValuePropName?: string;
  valuePropName?: string;
  trigger?: string;
  isEqual?: (prev: T, next: T) => boolean;
  isControlled?: (props: Props, valuePropName: string) => boolean;
}

export type Props = Record<string, any>;

export interface StandardProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (val: T) => void;
  isEqual?: (prev: T, next: T) => boolean;
}

export function useControllableState<T = any>(
  props: StandardProps<T>
): [T, (v: SetStateAction<T>) => T];
export function useControllableState<T = any>(
  props?: Props,
  options?: Options<T>
): [T, (v: SetStateAction<T>, ...args: any[]) => T];
export function useControllableState<T = any>(defaultProps?: Props, options: Options<T> = {}) {
  const props = defaultProps ?? {};

  const {
    defaultValue,
    defaultValuePropName = "defaultValue",
    valuePropName = "value",
    trigger = "onChange",
    isEqual = props.isEqual ?? Object.is,
    isControlled: getIsControlled,
  } = options;

  const value = props[valuePropName] as T | undefined;
  const isControlled = getIsControlled
    ? getIsControlled(props, valuePropName)
    : value !== undefined;

  const initialValueRef = useRef<T | undefined>(undefined);
  const hasInitialValueRef = useRef(false);

  if (!hasInitialValueRef.current) {
    hasInitialValueRef.current = true;
    initialValueRef.current = isControlled
      ? value
      : Object.prototype.hasOwnProperty.call(props, defaultValuePropName)
        ? props[defaultValuePropName]
        : defaultValue;
  }

  const stateRef = useRef<T>(initialValueRef.current as T);
  if (isControlled) {
    stateRef.current = value as T;
  }

  const update = useUpdate();

  function setState(v: SetStateAction<T>, ...args: any[]) {
    const next = (isFunction(v) ? v(stateRef.current) : v) as T;

    if (isEqual(stateRef.current, next)) {
      return next;
    }

    if (!isControlled) {
      stateRef.current = next;
      update();
    }
    props[trigger]?.(next, ...args);

    return next;
  }

  return [stateRef.current, useMemoizedFn(setState)] as const;
}
