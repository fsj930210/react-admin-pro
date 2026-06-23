import type { TreeFeature, TreeItemInstance, TreeKey, TreeNode } from "../types";

type SearchFeatureOptions = {
  highlightKey?: string;
  onSearch?: (keyword: string, matchedKeys: TreeKey[], matchedItems: TreeItemInstance[]) => void;
};

function getText(node: TreeNode, key: string) {
  const value = node[key];
  return typeof value === "string" ? value : "";
}

function getHighlightSegments(
  text: string,
  keyword: string
): Array<{ text: string; matched: boolean }> {
  if (!keyword) return [{ text, matched: false }];
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const segments: Array<{ text: string; matched: boolean }> = [];
  let cursor = 0;
  let index = lowerText.indexOf(lowerKeyword);
  while (index !== -1) {
    if (index > cursor) segments.push({ text: text.slice(cursor, index), matched: false });
    segments.push({ text: text.slice(index, index + keyword.length), matched: true });
    cursor = index + keyword.length;
    index = lowerText.indexOf(lowerKeyword, cursor);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), matched: false });
  return segments;
}

export function searchFeature({
  highlightKey = "label",
  onSearch,
}: SearchFeatureOptions = {}): TreeFeature {
  return {
    name: "search-feature",
    install(ctx) {
      const keyword = ctx.registerState("search.keyword", "");
      const matchedKeys = ctx.registerState<Set<TreeKey>>("search.matchedKeys", new Set());
      const resultKeys = ctx.registerState<Set<TreeKey>>("search.resultKeys", new Set());
      let expandedKeysBeforeSearch: TreeKey[] | null = null;

      const runSearch = (nextKeyword: string) => {
        const trimmed = nextKeyword.trim();
        const nextMatched = new Set<TreeKey>();
        const nextResults = new Set<TreeKey>();
        const pathKeys = new Set<TreeKey>();
        if (trimmed) {
          if (!expandedKeysBeforeSearch) {
            expandedKeysBeforeSearch = ctx.tree.getExpandedKeys?.() ?? null;
          }
          for (const item of ctx.tree.items.values()) {
            if (getText(item.node, highlightKey).toLowerCase().includes(trimmed.toLowerCase())) {
              nextMatched.add(item.key);
              nextResults.add(item.key);
              let parentKey = item.parentKey;
              while (parentKey) {
                nextResults.add(parentKey);
                pathKeys.add(parentKey);
                parentKey = ctx.tree.parentByKey.get(parentKey) ?? null;
              }
            }
          }
          if (pathKeys.size > 0 && ctx.tree.updateExpandedKeys) {
            ctx.tree.updateExpandedKeys([
              ...new Set([...(ctx.tree.getExpandedKeys?.() ?? []), ...pathKeys]),
            ]);
          }
        } else if (expandedKeysBeforeSearch && ctx.tree.updateExpandedKeys) {
          ctx.tree.updateExpandedKeys(expandedKeysBeforeSearch);
          expandedKeysBeforeSearch = null;
        }
        keyword.set(nextKeyword, {
          changedKeys: Array.from(nextResults),
          selectorKeys: ["search.keyword"],
        });
        matchedKeys.set(nextMatched, {
          changedKeys: Array.from(nextResults),
          selectorKeys: ["search.matchedKeys"],
        });
        resultKeys.set(nextResults, { visibleChanged: true, selectorKeys: ["search.resultKeys"] });
        onSearch?.(
          nextKeyword,
          Array.from(nextMatched),
          Array.from(nextMatched)
            .map((key) => ctx.tree.getItem(key))
            .filter(Boolean) as TreeItemInstance[]
        );
      };

      ctx.tree.search = runSearch;
      ctx.tree.clearSearch = () => runSearch("");
      ctx.tree.getMatchedKeys = () => Array.from(matchedKeys.get());
      ctx.tree.getSearchResultKeys = () => Array.from(resultKeys.get());

      ctx.registerSelector("search.keyword", () => keyword.get());
      ctx.registerSelector("search.matchedKeys", () => Array.from(matchedKeys.get()));
      ctx.registerSelector("search.resultKeys", () => Array.from(resultKeys.get()));
      ctx.registerItemState("matched", (item) => matchedKeys.get().has(item.key));
      ctx.registerItemState("matchedSegments", (item) =>
        getHighlightSegments(getText(item.node, highlightKey), keyword.get())
      );
      ctx.registerVisiblePipeline("search.visible", (items) => {
        if (!keyword.get().trim()) return items;
        const keys = resultKeys.get();
        return items.filter((item) => keys.has(item.key));
      });
      ctx.onRebuild(() => {
        if (keyword.get().trim()) runSearch(keyword.get());
      });
    },
  };
}
