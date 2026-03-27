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
  containerScrollPosition?: ScrollPosition;
}

export interface KeepAliveOptions {
  includes?: MatchPatternList;
  excludes?: MatchPatternList;
  max?: number;
  saveScrollPosition?: boolean;
  refreshDelay?: number;
	cacheKey: string;
  onActivate?: (cacheKey: string) => void;
  onDeactivate?: (cacheKey: string) => void;
}

export type KeepAliveProps = Omit<React.ComponentProps<"div">, 'ref'> & {
  children: ReactNode;
  excludes?: MatchPatternList;
  includes?: MatchPatternList;
  cacheKey: string;
  refreshDelay?: number;
  saveScrollPosition?: boolean;
  refreshRender?: (item: CachedItem) => ReactNode;
  onActivate?: (cacheKey: string) => void;
  onDeactivate?: (cacheKey: string) => void;
  ref?: React.RefObject<KeepAliveRef | null>;
}

export interface KeepAliveRef {
  handleRefreshCache: (key: string) => void;
  handleRemoveCache: (keys: string[]) => void;
}


export type KeepAliveContextValue = {
	lruCacheRef: React.RefObject<LRUCache<string, CachedItem> | null> | null;
};
