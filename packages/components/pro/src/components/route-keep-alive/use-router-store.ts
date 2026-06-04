import { useCallback, useSyncExternalStore } from "react";

function noop() {
  return undefined;
}

export function useRouterStore<T>(store: any, selector: (value: any) => T): T {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!store?.subscribe) return noop;
      const subscription = store.subscribe(onStoreChange);
      return subscription?.unsubscribe ?? subscription ?? noop;
    },
    [store]
  );

  const getSnapshot = useCallback(() => selector(store?.get?.()), [selector, store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
