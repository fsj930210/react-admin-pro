import type { TreeFeature, TreeItemInstance, TreeKey } from "../types";

type ExpandableFeatureOptions = {
	expandedKeys?: TreeKey[];
	defaultExpandedKeys?: TreeKey[];
	onExpandedKeysChange?: (
		keys: TreeKey[],
		info: { expanded: boolean; key: TreeKey; item?: TreeItemInstance },
	) => void;
	onExpand?: (
		expandedKeys: TreeKey[],
		expandedItems: TreeItemInstance[],
		expandInfo: { expanded: boolean; node: TreeItemInstance },
	) => void;
};

export function expandableFeature({
	expandedKeys,
	defaultExpandedKeys,
	onExpandedKeysChange,
	onExpand,
}: ExpandableFeatureOptions = {}): TreeFeature {
	return {
		name: "expandable-feature",
		install(ctx) {
			const isControlled = expandedKeys !== undefined;
			const store = ctx.registerState<Set<TreeKey>>(
				"expandable.expandedKeys",
				new Set(expandedKeys ?? defaultExpandedKeys ?? []),
			);

			const getSet = () => new Set(isControlled ? expandedKeys : store.get());
			const commit = (next: Set<TreeKey>, key: TreeKey, expanded: boolean) => {
				if (!isControlled) {
					store.set(next, { visibleChanged: true, selectorKeys: ["expandedKeys"] });
				} else {
					ctx.notify({ visibleChanged: true, selectorKeys: ["expandedKeys"] });
				}
				const keys = Array.from(next);
				const item = ctx.tree.getItem(key);
				onExpandedKeysChange?.(keys, { expanded, key, item });
				if (item) {
					onExpand?.(
						keys,
						keys.map((itemKey) => ctx.tree.getItem(itemKey)).filter(Boolean) as TreeItemInstance[],
						{ expanded, node: item },
					);
				}
			};

			const expand = (key: TreeKey) => {
				const next = getSet();
				if (next.has(key)) return;
				next.add(key);
				commit(next, key, true);
			};
			const collapse = (key: TreeKey) => {
				const next = getSet();
				if (!next.has(key)) return;
				next.delete(key);
				commit(next, key, false);
			};
			const toggleExpanded = (key: TreeKey) => {
				if (getSet().has(key)) collapse(key);
				else expand(key);
			};

			ctx.tree.expand = expand;
			ctx.tree.collapse = collapse;
			ctx.tree.toggleExpanded = toggleExpanded;
			ctx.tree.getExpandedKeys = () => Array.from(getSet());
			ctx.tree.updateExpandedKeys = (keys) => {
				const next = new Set(keys);
				if (!isControlled)
					store.set(next, { visibleChanged: true, selectorKeys: ["expandedKeys"] });
				onExpandedKeysChange?.(Array.from(next), {
					expanded: true,
					key: keys[0] ?? "",
					item: undefined,
				});
			};

			ctx.registerItemState("expanded", (item) => getSet().has(item.key));
			ctx.registerVisiblePipeline("expandable.visible", (items, tree) => {
				const next: TreeItemInstance[] = [];
				const expanded = getSet();
				for (const item of items) {
					let parentKey = item.parentKey;
					let visible = true;
					while (parentKey) {
						if (!expanded.has(parentKey)) {
							visible = false;
							break;
						}
						parentKey = tree.parentByKey.get(parentKey) ?? null;
					}
					if (visible) next.push(item);
				}
				return next;
			});
		},
	};
}
