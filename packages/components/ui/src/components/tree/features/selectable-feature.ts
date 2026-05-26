import type { TreeFeature, TreeItemInstance, TreeKey } from "../types";

type SelectableFeatureOptions = {
	selectedKeys?: TreeKey[];
	defaultSelectedKeys?: TreeKey[];
	multiple?: boolean;
	onSelectedKeysChange?: (
		keys: TreeKey[],
		info: { selected: boolean; key: TreeKey; item?: TreeItemInstance },
	) => void;
	onSelect?: (
		selectedKeys: TreeKey[],
		selectedItems: TreeItemInstance[],
		selectInfo: { selected: boolean; node: TreeItemInstance },
	) => void;
};

export function selectableFeature({
	selectedKeys,
	defaultSelectedKeys,
	multiple = false,
	onSelectedKeysChange,
	onSelect,
}: SelectableFeatureOptions = {}): TreeFeature {
	return {
		name: "selectable-feature",
		install(ctx) {
			const isControlled = selectedKeys !== undefined;
			const store = ctx.registerState<Set<TreeKey>>(
				"selectable.selectedKeys",
				new Set(selectedKeys ?? defaultSelectedKeys ?? []),
			);
			const getSet = () => new Set(isControlled ? selectedKeys : store.get());

			const commit = (next: Set<TreeKey>, key: TreeKey, selected: boolean) => {
				if (!isControlled) store.set(next, { changedKeys: [key], selectorKeys: ["selectedKeys"] });
				else ctx.notify({ changedKeys: [key], selectorKeys: ["selectedKeys"] });
				const keys = Array.from(next);
				const item = ctx.tree.getItem(key);
				onSelectedKeysChange?.(keys, { selected, key, item });
				if (item) {
					onSelect?.(
						keys,
						keys.map((itemKey) => ctx.tree.getItem(itemKey)).filter(Boolean) as TreeItemInstance[],
						{ selected, node: item },
					);
				}
			};

			const select = (key: TreeKey, selected = true) => {
				const item = ctx.tree.getItem(key);
				if (!item || item.disabled) return;
				const next = getSet();
				const wasSelected = next.has(key);
				if (!multiple) next.clear();
				if (selected) next.add(key);
				else next.delete(key);
				if (wasSelected === selected && (multiple || next.size <= 1)) return;
				commit(next, key, selected);
			};

			ctx.tree.select = select;
			ctx.tree.unselect = (key) => select(key, false);
			ctx.tree.getSelectedKeys = () => Array.from(getSet());
			ctx.tree.updateSelectedKeys = (keys) => {
				if (!isControlled)
					store.set(new Set(keys), { changedKeys: keys, selectorKeys: ["selectedKeys"] });
				onSelectedKeysChange?.(keys, { selected: true, key: keys[0] ?? "", item: undefined });
			};

			ctx.registerItemState("selected", (item) => getSet().has(item.key));
		},
	};
}
