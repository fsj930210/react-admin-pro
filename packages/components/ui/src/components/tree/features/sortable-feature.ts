import type { DropIntent, TreeFeature } from "../types";

type SortableFeatureOptions = {
	expandOnDropInside?: boolean;
	onMove?: (intent: DropIntent) => void;
};

export function sortableFeature({
	expandOnDropInside = true,
	onMove,
}: SortableFeatureOptions = {}): TreeFeature {
	return {
		name: "sortable-feature",
		depends: ["dnd-feature", "crud-feature"],
		install(ctx) {
			ctx.registerAction("sortable.drop", () => {
				const intent = ctx.tree.getSelectorValue<DropIntent>("dnd.dropIntent");
				if (!intent?.valid) return intent;
				const result = ctx.tree.moveNode(
					intent.dragKey,
					intent.dropTargetKey,
					intent.position,
					intent.nextIndex,
				);
				if (result.ok && expandOnDropInside && intent.position === "inside") {
					ctx.tree.expand?.(intent.dropTargetKey);
				}
				onMove?.(intent);
				ctx.tree.actions["dnd.cancel"]?.();
				return result;
			});
		},
	};
}
