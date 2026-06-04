import type { TreeFeature, TreeKey, TreeMutationResult, TreeNode } from "../types";

type AsyncLoaderFeatureOptions = {
  loadChildren: (node: TreeNode) => Promise<TreeNode[]>;
  onLoadError?: (error: unknown, key: TreeKey) => void;
};

export function asyncLoaderFeature({
  loadChildren,
  onLoadError,
}: AsyncLoaderFeatureOptions): TreeFeature {
  return {
    name: "async-loader-feature",
    install(ctx) {
      const loadingKeys = ctx.registerState<Set<TreeKey>>("async.loadingKeys", new Set());
      const loadedKeys = ctx.registerState<Set<TreeKey>>("async.loadedKeys", new Set());
      const errorByKey = ctx.registerState<Map<TreeKey, unknown>>("async.errorByKey", new Map());
      const inFlight = new Map<TreeKey, Promise<TreeMutationResult | undefined>>();

      const load = async (key: TreeKey): Promise<TreeMutationResult | undefined> => {
        const item = ctx.tree.getItem(key);
        if (!item)
          return {
            ok: false,
            changedKeys: [],
            structureChanged: false,
            reason: `Node "${key}" was not found.`,
          };
        if (inFlight.has(key)) return inFlight.get(key);
        if (loadedKeys.get().has(key) && item.node.children && item.node.children.length > 0)
          return;

        const loading = new Set(loadingKeys.get());
        loading.add(key);
        loadingKeys.set(loading, { changedKeys: [key], selectorKeys: ["async.loadingKeys"] });

        const request = loadChildren(item.node)
          .then((children) => {
            const result = ctx.tree.replaceChildren(key, children);
            const nextLoaded = new Set(loadedKeys.get());
            nextLoaded.add(key);
            loadedKeys.set(nextLoaded, { changedKeys: [key], selectorKeys: ["async.loadedKeys"] });
            const nextErrors = new Map(errorByKey.get());
            nextErrors.delete(key);
            errorByKey.set(nextErrors, { changedKeys: [key], selectorKeys: ["async.errorByKey"] });
            return result;
          })
          .catch((error) => {
            const nextErrors = new Map(errorByKey.get());
            nextErrors.set(key, error);
            errorByKey.set(nextErrors, { changedKeys: [key], selectorKeys: ["async.errorByKey"] });
            onLoadError?.(error, key);
            return undefined;
          })
          .finally(() => {
            inFlight.delete(key);
            const nextLoading = new Set(loadingKeys.get());
            nextLoading.delete(key);
            loadingKeys.set(nextLoading, {
              changedKeys: [key],
              selectorKeys: ["async.loadingKeys"],
            });
          });

        inFlight.set(key, request);
        return request;
      };

      ctx.tree.loadChildren = load;
      ctx.registerItemState("loading", (item) => loadingKeys.get().has(item.key));
      ctx.registerItemState("loaded", (item) => loadedKeys.get().has(item.key));
      ctx.registerItemState("loadError", (item) => errorByKey.get().get(item.key));
    },
    depends: ["expandable-feature"],
  };
}
