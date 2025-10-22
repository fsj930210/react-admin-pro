import type {
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "../types";
import { defineProperty, getItemsByKeys } from "../utils";

declare module "../types.ts" {
	interface TreeInstance {
		search?: (keyword: string) => void;
		clearSearch?: () => void;
		getSearchResultKeys?: () => string[];
		getMatchedKeys?: () => string[];
	}
	interface TreeItemInstance {
		matched?: boolean;
		matchedText?: string[];
		getMatchedSegments?: () => Array<{ text: string; matched: boolean }>;
	}
}

type SearchFeatureOptions = {
	searchDelay?: number;
	highlightKey?: string;
	onSearch?: (
		keyword: string,
		matchedKeys: string[],
		matchedItems: TreeItemInstance[],
	) => void;
};

function getHighlightSegments(
	text: string,
	keyword: string,
): Array<{ text: string; matched: boolean }> {
	if (!keyword) return [{ text, matched: false }];

	const segments: Array<{ text: string; matched: boolean }> = [];
	let lastIndex = 0;
	const lowerText = text.toLowerCase();
	const lowerKeyword = keyword.toLowerCase();

	let index = lowerText.indexOf(lowerKeyword);
	while (index !== -1) {
		if (index > lastIndex) {
			segments.push({
				text: text.slice(lastIndex, index),
				matched: false,
			});
		}
		segments.push({
			text: text.slice(index, index + keyword.length),
			matched: true,
		});
		lastIndex = index + keyword.length;
		index = lowerText.indexOf(lowerKeyword, lastIndex);
	}

	if (lastIndex < text.length) {
		segments.push({
			text: text.slice(lastIndex),
			matched: false,
		});
	}

	return segments;
}

function matchNode(
	node: TreeNode,
	keyword: string,
	highlightKey: string = "label",
): boolean {
	if (!keyword) return false;

	const text = node[highlightKey as keyof TreeNode] as string;
	if (text && typeof text === "string") {
		return text.toLowerCase().includes(keyword.toLowerCase());
	}
	return false;
}

function findMatchedNodes(
	nodes: TreeNode[],
	keyword: string,
	highlightKey: string = "label",
	matchedKeys: Set<string> = new Set(),
): Set<string> {
	for (const node of nodes) {
		if (matchNode(node, keyword, highlightKey)) {
			matchedKeys.add(node.key);
		}
		if (node.children) {
			findMatchedNodes(node.children, keyword, highlightKey, matchedKeys);
		}
	}
	return matchedKeys;
}

function getResultKeys(
	matchedKeys: Set<string>,
	tree: TreeInstance,
): Set<string> {
	const resultKeys = new Set(matchedKeys);

	// 添加所有匹配节点的祖先节点，确保它们在搜索结果中可见
	matchedKeys.forEach((key) => {
		let currentItem = tree.getItem(key);
		while (currentItem?.parentKey) {
			resultKeys.add(currentItem.parentKey);
			currentItem = tree.getItem(currentItem.parentKey);
		}
	});

	return resultKeys;
}

export function searchFeature({
	searchDelay = 300,
	highlightKey = "label",
	onSearch,
}: SearchFeatureOptions = {}): TreeFeature {
	return {
		name: "search-feature",
		install(tree: TreeInstance) {
			let currentKeyword = "";
			let matchedKeys = new Set<string>();
			let searchResultKeys = new Set<string>();
			let searchTimer: ReturnType<typeof setTimeout> | null = null;

			const doSearch = (keyword: string) => {
				currentKeyword = keyword;
				matchedKeys.clear();
				searchResultKeys.clear();

				if (keyword.trim()) {
					matchedKeys = findMatchedNodes(tree.nodes, keyword, highlightKey);
					searchResultKeys = getResultKeys(matchedKeys, tree);
				}

				// 更新所有节点的匹配状态
				tree.items.forEach((item) => {
					item.matched = matchedKeys.has(item.key);
					const node = item.node;
					const text = node[highlightKey as keyof TreeNode] as string;
					item.matchedText = item.matched && text ? [text] : [];
				});

				onSearch?.(
					keyword,
					Array.from(matchedKeys),
					getItemsByKeys(tree.items, Array.from(matchedKeys)),
				);
				tree.notify();
			};

			tree.search = (keyword: string) => {
				if (searchTimer) {
					clearTimeout(searchTimer);
				}

				searchTimer = setTimeout(() => {
					doSearch(keyword);
				}, searchDelay);
			};

			tree.clearSearch = () => {
				if (searchTimer) {
					clearTimeout(searchTimer);
				}
				doSearch("");
			};

			tree.getSearchResultKeys = () => Array.from(searchResultKeys);
			tree.getMatchedKeys = () => Array.from(matchedKeys);

			// 扩展默认的 getVisibleItems 方法以支持搜索过滤
			const originalGetVisibleItems = tree.getVisibleItems;
			tree.getVisibleItems = () => {
				if (!currentKeyword.trim()) {
					return originalGetVisibleItems();
				}

				// 在搜索模式下，只返回搜索结果相关的节点
				const visibleItems: TreeItemInstance[] = [];

				const walk = (nodes: TreeNode[]) => {
					for (const node of nodes) {
						const item = tree.getItem(node.key);
						if (item && searchResultKeys.has(node.key)) {
							visibleItems.push(item);
							if (node.children) {
								walk(node.children);
							}
						}
					}
				};

				walk(tree.nodes);
				return visibleItems;
			};

			const init = () => {
				tree.items.forEach((item) => {
					defineProperty(item, "matched", {
						configurable: true,
						enumerable: true,
						value: false,
						writable: true,
					});

					defineProperty(item, "matchedText", {
						configurable: true,
						enumerable: true,
						value: [],
						writable: true,
					});

					item.getMatchedSegments = () => {
						const node = item.node;
						const text = node[highlightKey as keyof TreeNode] as string;
						return text && typeof text === "string"
							? getHighlightSegments(text, currentKeyword)
							: [{ text: String(text || ""), matched: false }];
					};
				});
			};

			init();
			tree.onRebuild = () => {
				init();
				// 重建后重新执行搜索
				if (currentKeyword.trim()) {
					doSearch(currentKeyword);
				}
			};
		},
	};
}
