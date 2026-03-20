import type { ReactNode } from 'react';
import type { LRUCache } from 'lru-cache';

export type MatchPattern = string | RegExp;

export type MatchPatternList = MatchPattern | MatchPattern[];

export interface ScrollPosition {
  x: number;
  y: number;
}

export interface ScrollNodePosition {
  node: Element;
  position: ScrollPosition;
}

export interface CachedItem{
  key: string;
  component: ReactNode;
  cachedScrollNodes?: ScrollNodePosition[];
  containerRef?: HTMLDivElement | null;
  cacheKey: string;
  refreshing?: boolean;
}

export interface KeepAliveOptions {
  includes?: MatchPatternList;
  excludes?: MatchPatternList;
  max?: number;
  saveScrollPosition?: boolean;
}

export type KeepAliveProps = React.ComponentProps<"div"> & {
  children: ReactNode;
  excludes?: MatchPatternList;
  includes?: MatchPatternList;
  cacheKey: string;
  saveScrollPosition?: boolean;
  onActivate?: (cacheKey: string) => void;
  onDeactivate?: (cacheKey: string) => void;
}

export interface KeepAliveRef<TCached = unknown> {
  clearAllCache: () => void;
  refreshCache: (key: string) => void;
  removeCache: (key: string) => void;
  removeCacheByKeys: (keys: string[]) => void;
  updateCacheData: <TData extends TCached>(key: string, data: TData) => void;
  getCacheData: <TData extends TCached>(key: string) => TData | undefined;
  hasCache: (key: string) => boolean;
}


export type KeepAliveContextValue = {
	lruCacheRef: React.RefObject<LRUCache<string, CachedItem> | null> | null;
};
