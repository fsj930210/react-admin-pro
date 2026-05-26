import { useEffect, useState, useRef } from "react";
import type { CachedItem, KeepAliveOptions } from "./types";
import { matchCondition } from "./utils/matchCondition";
import { useKeepAliveContext } from "./keep-alive-context";
import { 
	saveScrollPosition as saveScrollPositionUtil, 
	restoreScrollPosition as restoreScrollPositionUtil 
} from "./utils/scrollPosition";
import debounce from "lodash-es/debounce";
import { v4 as uuidv4 } from "uuid";

export function useKeepAlive(props: KeepAliveOptions) {
	const {
		excludes,
		includes,
		cacheKey,
		onActivate,
		onDeactivate,
		saveScrollPosition: shouldSaveScrollPosition = true,
		refreshDelay = 2000,
	} = props;
	
	const { lruCacheRef } = useKeepAliveContext();
	const [cachedItems, setCachedItems] = useState<CachedItem[]>([]);
	const [excludeItems, setExcludeItems] = useState<CachedItem[]>([]);
	
	const containerRef = useRef<HTMLDivElement | null>(null);
	const prevCacheKeyRef = useRef<string | null>(null);
	const debouncedSaveScrollPosition = useRef<{ (cacheKey: string, container: HTMLElement | null): void; cancel: () => void } | undefined>(undefined);

	const shouldCache = matchCondition(cacheKey, includes, excludes);

	const saveScrollPosition = (cacheKey: string, container: HTMLElement | null) => {
		if (!container) return;
		const scrollNodes = saveScrollPositionUtil(container);
		const cachedItem = lruCacheRef?.current?.get(cacheKey);
		if (cachedItem) {
			cachedItem.cachedScrollNodes = scrollNodes;
			cachedItem.containerScrollPosition = { x: container.scrollLeft, y: container.scrollTop };
			lruCacheRef?.current?.set(cacheKey, cachedItem);
		}
	};

	const restoreScrollPosition = (cacheKey: string, container: HTMLElement | null) => {
		if (!container) return;
		
		if (!shouldCache || !shouldSaveScrollPosition) {
			container.scrollTo({ left: 0, top: 0, behavior: 'instant' });
			return;
		}
		
		const cachedItem = lruCacheRef?.current?.get(cacheKey);
		const scrollNodes = cachedItem?.cachedScrollNodes;
		const containerScrollPosition = cachedItem?.containerScrollPosition;
		if (scrollNodes && scrollNodes.length > 0) {
			requestAnimationFrame(() => {
				restoreScrollPositionUtil(scrollNodes);
			});
		}
		
		if (containerScrollPosition) {
			requestAnimationFrame(() => {
				container.scrollTo({
					left: containerScrollPosition.x,
					top: containerScrollPosition.y,
					behavior: 'instant',
				});
			});
		} else {
			container.scrollTo({ left: 0, top: 0, behavior: 'instant' });
		}
	};

	const clearScrollPosition = (cacheKey: string) => {
		const cachedItem = lruCacheRef?.current?.get(cacheKey);
		if (cachedItem) {
			cachedItem.cachedScrollNodes = [];
			lruCacheRef?.current?.set(cacheKey, cachedItem);
		}
	};

	const handleRefreshCache = (cachedKey: string) => {
		const cachedItem = lruCacheRef?.current?.get(cachedKey);
		console.log("handleRefreshCache", cachedItem, cachedKey, lruCacheRef?.current?.size);
		if (!cachedItem) return;

		const newKey = uuidv4();

		if (refreshDelay > 0) {
			cachedItem.refreshing = true;
			cachedItem.key = newKey;
			lruCacheRef?.current?.set(cachedKey, cachedItem);

			setCachedItems(prev => prev.map(item => 
				item.cacheKey === cachedKey ? { ...item, key: newKey, refreshing: true } : item
			));

			setTimeout(() => {
				const refreshedItem = lruCacheRef?.current?.get(cachedKey);
				if (refreshedItem) {
					refreshedItem.refreshing = false;
					lruCacheRef?.current?.set(cachedKey, refreshedItem);
				}
				setCachedItems(prev => prev.map(item => 
					item.cacheKey === cachedKey ? { ...item, refreshing: false } : item
				));
			}, refreshDelay);
		} else {
			cachedItem.key = newKey;
			lruCacheRef?.current?.set(cachedKey, cachedItem);

			setCachedItems(prev => prev.map(item => 
				item.cacheKey === cachedKey ? { ...item, key: newKey } : item
			));
		}
	};

	const handleRemoveCache = (cachedKeys: string[]) => {
		if (!lruCacheRef?.current) return;

		cachedKeys.forEach(key => {
			lruCacheRef.current?.delete(key);
		});

		setCachedItems(prev => prev.filter(item => !cachedKeys.includes(item.cacheKey)));
	};

	const handleAddCache = (maybeCachedItem: CachedItem) => {
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

	useEffect(() => {
		debouncedSaveScrollPosition.current = debounce((key: string, container: HTMLElement | null) => {
			saveScrollPosition(key, container);
		}, 300);

		const container = containerRef.current;
		if (container) {
			const handleScroll = () => {
				debouncedSaveScrollPosition.current?.(cacheKey, container);
			};

			container.addEventListener('scroll', handleScroll, true);
			container.addEventListener('touchmove', handleScroll, true);

			return () => {
				container.removeEventListener('scroll', handleScroll, true);
				container.removeEventListener('touchmove', handleScroll, true);
				debouncedSaveScrollPosition.current?.cancel();
			};
		}
	}, [cacheKey]);

	useEffect(() => {
		const prevCacheKey = prevCacheKeyRef.current;
		if (prevCacheKey && prevCacheKey !== cacheKey) {
			onDeactivate?.(prevCacheKey);
		}
		if (cacheKey && prevCacheKey !== cacheKey) {
			restoreScrollPosition(cacheKey, containerRef.current);
			onActivate?.(cacheKey);
			
		}
		prevCacheKeyRef.current = cacheKey;
	}, [cacheKey, onActivate, onDeactivate]);

	return {
		excludeItems,
		cachedItems,
		containerRef,
		handleAddCache,
		handleRefreshCache,
		handleRemoveCache,
		saveScrollPosition,
		restoreScrollPosition,
		clearScrollPosition,
	};
}
