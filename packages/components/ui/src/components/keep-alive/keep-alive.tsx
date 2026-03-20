import { useEffect } from "react";
import { Activity, Fragment } from "react";
import type { CachedItem, KeepAliveProps } from "./types";
import { useKeepAlive } from "./use-keep-alive";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@rap/utils";

export function KeepAlive({
	className,
	excludes,
	includes,
	cacheKey,
	children,
	saveScrollPosition,
	onActivate,
	onDeactivate,
}: KeepAliveProps) {
	const { handleCache, excludeItems, cachedItems, containerRef } = useKeepAlive({
		includes,
		excludes,
		cacheKey,
		onActivate,
		onDeactivate,
		saveScrollPosition,
	});

	useEffect(() => {
		const item: CachedItem = {
			key: uuidv4(),
			component: children,
			cacheKey: cacheKey,
			refreshing: false,
			cachedScrollNodes: [],
			containerRef: containerRef.current,
		}
		handleCache(item);
	}, [cacheKey]);

	return (
		<div ref={containerRef} className={cn("size-full", className)}>
			{cachedItems?.map((item) =>
				item.refreshing ? (
					<Fragment key={item.key}>{item.component}</Fragment>
				) : (
					<Activity
						key={item.key}
						mode={item.cacheKey === cacheKey ? 'visible' : 'hidden'}
					>
						{item.component}
					</Activity>
				),
			)}
			{excludeItems?.map((item) =>
				cacheKey === item.cacheKey ? (
					<Fragment key={item.key}>{item.component}</Fragment>
				) : null,
			)}
		</div>
	)
}
