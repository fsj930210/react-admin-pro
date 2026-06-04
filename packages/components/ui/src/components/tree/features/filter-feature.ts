import type { TreeFeature, TreeItemInstance } from "../types";

type FilterFeatureOptions = {
  filter?: (item: TreeItemInstance) => boolean;
};

export function filterFeature({ filter }: FilterFeatureOptions = {}): TreeFeature {
  return {
    name: "filter-feature",
    install(ctx) {
      const filterStore = ctx.registerState<typeof filter>("filter.predicate", filter);
      ctx.registerAction("filter.update", (nextFilter: typeof filter) => {
        filterStore.set(nextFilter, { visibleChanged: true, selectorKeys: ["filter.predicate"] });
      });
      ctx.registerVisiblePipeline("filter.visible", (items) => {
        const predicate = filterStore.get();
        return predicate ? items.filter(predicate) : items;
      });
    },
  };
}
