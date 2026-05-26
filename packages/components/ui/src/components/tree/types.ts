export type TreeKey = string;

export interface TreeNode {
	key: TreeKey;
	label: string;
	children?: TreeNode[];
	disabled?: boolean;
	isLeaf?: boolean;
	[key: string]: unknown;
}

export interface TreeItemInstance {
	key: TreeKey;
	tree: TreeInstance;
	parentKey: TreeKey | null;
	node: TreeNode;
	depth: number;
	index: number;
	disabled: boolean;
	isLeaf: boolean;
	[key: string]: unknown;
}

export interface TreeMutationResult {
	ok: boolean;
	changedKeys: TreeKey[];
	structureChanged: boolean;
	reason?: string;
}

export type TreeStateStore<T> = {
	get: () => T;
	set: (value: T | ((previous: T) => T), options?: TreeNotifyOptions) => void;
};

export type TreeNotifyOptions = {
	changedKeys?: TreeKey[];
	structureChanged?: boolean;
	visibleChanged?: boolean;
	selectorKeys?: string[];
};

export type TreeVisiblePipeline = (
	items: TreeItemInstance[],
	tree: TreeInstance,
) => TreeItemInstance[];
export type TreeItemStateGetter<T = unknown> = (item: TreeItemInstance, tree: TreeInstance) => T;
export type TreeActionGuard<TPayload = unknown> = (
	payload: TPayload,
	tree: TreeInstance,
) => boolean | string;
export type TreeDisposer = () => void;

export type TreeAction = (...args: unknown[]) => unknown;

export interface TreeFeatureContext {
	tree: TreeInstance;
	registerState: <T>(key: string, initialValue: T) => TreeStateStore<T>;
	registerAction: <TArgs extends unknown[], TResult>(
		key: string,
		action: (...args: TArgs) => TResult,
	) => (...args: TArgs) => TResult;
	registerSelector: <T>(key: string, selector: (tree: TreeInstance) => T) => void;
	registerItemState: <T>(key: string, getValue: TreeItemStateGetter<T>) => void;
	registerVisiblePipeline: (name: string, pipeline: TreeVisiblePipeline) => void;
	registerActionGuard: <TPayload = unknown>(
		actionKey: string,
		guard: TreeActionGuard<TPayload>,
	) => void;
	onRebuild: (effect: () => void) => void;
	onDispose: (effect: TreeDisposer) => void;
	invalidateVisible: () => void;
	notify: (options?: TreeNotifyOptions) => void;
}

export interface TreeFeature {
	name: string;
	depends?: string[];
	conflicts?: string[];
	/** @deprecated use conflicts */
	confilts?: string[];
	install: (ctx: TreeFeatureContext) => void;
}

export interface CreateTreeOptions {
	features?: TreeFeature[];
	indent?: number;
	isLeaf?: boolean | ((node: TreeNode) => boolean);
}

export type DropPosition = "before" | "inside" | "after";

export interface TreePoint {
	x: number;
	y: number;
}

export interface TreeRect {
	top: number;
	bottom: number;
	left: number;
	right: number;
	width: number;
	height: number;
}

export interface DropIntent {
	dragKey: TreeKey;
	dropTargetKey: TreeKey;
	position: DropPosition;
	dropLevelOffset: number;
	nextParentKey: TreeKey | null;
	nextIndex: number;
	valid: boolean;
	reason?: string;
}

export type LegacyDropPosition = -1 | 0 | 1;

export interface DropInfo {
	dropPosition: LegacyDropPosition;
	dropLevelOffset: number;
	dropTargetKey: TreeKey;
	rect: { left: number; top: number; width: number; height: number };
	intent?: DropIntent;
}

export interface TreeInstance {
	nodes: TreeNode[];
	indent: number;
	items: Map<TreeKey, TreeItemInstance>;
	nodeByKey: Map<TreeKey, TreeNode>;
	parentByKey: Map<TreeKey, TreeKey | null>;
	childrenByKey: Map<TreeKey | null, TreeKey[]>;
	depthByKey: Map<TreeKey, number>;
	orderedKeys: TreeKey[];
	actions: Record<string, TreeAction>;
	_count: number;

	getItem: (key: TreeKey) => TreeItemInstance | undefined;
	getItemState: <T = unknown>(key: TreeKey, stateKey: string) => T | undefined;
	getSelectorValue: <T = unknown>(key: string) => T | undefined;
	getVisibleItems: () => TreeItemInstance[];

	updateTree: (nodes: TreeNode[]) => TreeMutationResult;
	updateNode: (
		key: TreeKey,
		patch: Partial<TreeNode> | ((node: TreeNode) => TreeNode),
	) => TreeMutationResult;
	insertNode: (parentKey: TreeKey | null, node: TreeNode, index?: number) => TreeMutationResult;
	removeNode: (key: TreeKey) => TreeMutationResult;
	moveNode: (
		sourceKey: TreeKey,
		targetKey: TreeKey,
		position: DropPosition,
		index?: number,
	) => TreeMutationResult;
	replaceChildren: (parentKey: TreeKey | null, children: TreeNode[]) => TreeMutationResult;
	batch: (fn: () => void) => void;

	subscribe: (callback: () => void) => TreeDisposer;
	subscribeNode: (key: TreeKey, callback: () => void) => TreeDisposer;
	subscribeSelector: (key: string, callback: () => void) => TreeDisposer;
	notify: (options?: TreeNotifyOptions) => void;
	invalidateVisible: () => void;

	expand?: (key: TreeKey) => void;
	collapse?: (key: TreeKey) => void;
	toggleExpanded?: (key: TreeKey) => void;
	getExpandedKeys?: () => TreeKey[];
	updateExpandedKeys?: (keys: TreeKey[]) => void;
	select?: (key: TreeKey, selected?: boolean) => void;
	unselect?: (key: TreeKey) => void;
	getSelectedKeys?: () => TreeKey[];
	updateSelectedKeys?: (keys: TreeKey[]) => void;
	check?: (key: TreeKey, checked?: boolean) => void;
	uncheck?: (key: TreeKey) => void;
	getCheckedKeys?: () => TreeKey[];
	updateCheckedKeys?: (keys: TreeKey[]) => void;
	search?: (keyword: string) => void;
	clearSearch?: () => void;
	getMatchedKeys?: () => TreeKey[];
	getSearchResultKeys?: () => TreeKey[];
	loadChildren?: (key: TreeKey) => Promise<TreeMutationResult | undefined>;
}
