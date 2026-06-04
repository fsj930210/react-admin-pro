import { useState } from "react";
import { useMemoizedFn } from "./use-memoized-fn";

export const useUpdate = () => {
  const [, setState] = useState({});

  return useMemoizedFn(() => setState({}));
};
