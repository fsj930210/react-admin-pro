import { useRef } from "react";
import type { CachedItem } from "./types";
import { KeepAliveContext } from "./keep-alive-context";
import { LRUCache } from "lru-cache";

interface KeepAliveRootProps {
	children: React.ReactNode;
	max?: number;
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

