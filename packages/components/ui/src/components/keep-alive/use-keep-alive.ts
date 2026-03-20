import { useEffect, useState, useRef } from "react";
import type { CachedItem, KeepAliveOptions } from "./types";
import { matchCondition } from "./utils/matchCondition";
import { useKeepAliveContext } from "./keep-alive-context";
import { 
	saveScrollPosition as saveScrollPositionUtil, 
	restoreScrollPosition as restoreScrollPositionUtil 
} from "./utils/scrollPosition";
import { debounce } from "lodash-es";

export function useKeepAlive(props: KeepAliveOptions & { cacheKey: string; onActivate?: (cacheKey: string) => void; onDeactivate?: (cacheKey: string) => void; saveScrollPosition?: boolean }) {
	const {
		excludes,
		includes,
		cacheKey,
		onActivate,
		onDeactivate,
		saveScrollPosition: shouldSaveScrollPosition = true,
	} = props;
	
	const { lruCacheRef } = useKeepAliveContext();
	const [cachedItems, setCachedItems] = useState<CachedItem[]>([]);
	const [excludeItems, setExcludeItems] = useState<CachedItem[]>([]);
	
	const containerRef = useRef<HTMLDivElement | null>(null);
	const prevCacheKeyRef = useRef<string | null>(null);
	const debouncedSaveScrollPosition = useRef<{ (cacheKey: string, container: HTMLElement | null): void; cancel: () => void } | undefined>(undefined);

	const shouldCache = matchCondition(cacheKey, includes, excludes);

	const saveScrollPosition = (cacheKey: string, container: HTMLElement | null) => {
		if (!container || !shouldCache) return;
		const scrollNodes = saveScrollPositionUtil(container);
		const cachedItem = lruCacheRef?.current?.get(cacheKey);
		if (cachedItem) {
			cachedItem.cachedScrollNodes = scrollNodes;
			lruCacheRef?.current?.set(cacheKey, cachedItem);
		}
	};

	const restoreScrollPosition = (cacheKey: string, container: HTMLElement | null) => {
		if (!container || !shouldCache || !shouldSaveScrollPosition) return;
		const cachedItem = lruCacheRef?.current?.get(cacheKey);
		const scrollNodes = cachedItem?.cachedScrollNodes;
		if (scrollNodes && scrollNodes.length > 0) {
			// 使用 requestAnimationFrame 代替 setTimeout
			requestAnimationFrame(() => {
				restoreScrollPositionUtil(scrollNodes);
			});
		}
	};

	const clearScrollPosition = (cacheKey: string) => {
		const cachedItem = lruCacheRef?.current?.get(cacheKey);
		if (cachedItem) {
			cachedItem.cachedScrollNodes = [];
			lruCacheRef?.current?.set(cacheKey, cachedItem);
		}
	};

	const handleCache = (maybeCachedItem: CachedItem) => {
		if (!shouldCache) {
			setExcludeItems(prev => {
				const newExcludeItems = [...prev];
				const item = newExcludeItems.find(item => item.cacheKey === maybeCachedItem.cacheKey);
				if (!item) {
					newExcludeItems.push(maybeCachedItem);
				}
				return newExcludeItems;
			});
		} else {
			setCachedItems(prev => {
				const newCachedItems = [...prev];
				const item = newCachedItems.find(item => item.cacheKey === maybeCachedItem.cacheKey);
				if (!item) {
					const cachedItem = lruCacheRef?.current?.get(maybeCachedItem.cacheKey);
					if (cachedItem) {
						newCachedItems.push(cachedItem);
					} else {
						newCachedItems.push(maybeCachedItem);
						lruCacheRef?.current?.set(maybeCachedItem.cacheKey, maybeCachedItem);
					}
				}
				return newCachedItems;
			});
		}
	};

	useEffect(() => {
		if (lruCacheRef?.current) {
			const items = lruCacheRef.current.entries();
			const itemArray: CachedItem[] = [];
			for (const [_, value] of items) {
				itemArray.push(value);
			}
			setCachedItems(itemArray);
		}
	}, []);

	// 初始化防抖保存滚动位置函数并添加事件监听
	useEffect(() => {
		// 初始化防抖函数
		debouncedSaveScrollPosition.current = debounce((key: string, container: HTMLElement | null) => {
			saveScrollPosition(key, container);
		}, 300);

		const container = containerRef.current;
		if (container) {
			// 监听滚动和触摸事件
			const handleScroll = () => {
				debouncedSaveScrollPosition.current?.(cacheKey, container);
			};

			container.addEventListener('scroll', handleScroll, true);
			container.addEventListener('touchmove', handleScroll, true);

			return () => {
				container.removeEventListener('scroll', handleScroll, true);
				container.removeEventListener('touchmove', handleScroll, true);
				// 清理防抖函数
				debouncedSaveScrollPosition.current?.cancel();
			};
		}
	}, [cacheKey]);

	useEffect(() => {
		const prevCacheKey = prevCacheKeyRef.current;
		if (prevCacheKey && prevCacheKey !== cacheKey) {
			saveScrollPosition(prevCacheKey, containerRef.current);
			if (onDeactivate) {
				onDeactivate(prevCacheKey);
			}
		}
		if (cacheKey && prevCacheKey !== cacheKey) {
			restoreScrollPosition(cacheKey, containerRef.current);
			if (onActivate) {
				onActivate(cacheKey);
			}
		}
		prevCacheKeyRef.current = cacheKey;
	}, [cacheKey, onActivate, onDeactivate]);

	return {
		handleCache,
		excludeItems,
		cachedItems,
		containerRef,
		saveScrollPosition,
		restoreScrollPosition,
		clearScrollPosition,
	};
}
