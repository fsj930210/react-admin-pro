import { useRef } from "react";
import { LRUCache } from "lru-cache";

import type { CachedItem, KeepAliveOptions } from "./types";
import { KeepAliveContext } from "./keep-alive-context";

interface KeepAliveRootProps extends KeepAliveOptions {
	children: React.ReactNode;
}

export function KeepAliveRoot({ children, max = 20 }: KeepAliveRootProps) {
	const lruCacheRef = useRef<LRUCache<string, CachedItem>>(
		new LRUCache<string, CachedItem>({
			max,
		})
	);
	return (
		<KeepAliveContext value={{ lruCacheRef }}>
			{children}
		</KeepAliveContext>
	)
}

