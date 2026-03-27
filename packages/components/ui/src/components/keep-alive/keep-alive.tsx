import { useEffect, useImperativeHandle } from "react";
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
	refreshDelay,
	refreshRender,
	onActivate,
	onDeactivate,
	ref,
}: KeepAliveProps) {
	const {
		handleAddCache,
		handleRefreshCache,
		handleRemoveCache,
		excludeItems,
		cachedItems,
		containerRef,
	} = useKeepAlive({
		includes,
		excludes,
		saveScrollPosition,
		cacheKey,
		refreshDelay,
		onActivate,
		onDeactivate,
	});

	useEffect(() => {
		const item: CachedItem = {
			key: uuidv4(),
			component: children,
			cacheKey,
			refreshing: false,
			cachedScrollNodes: [],
			containerRef: containerRef.current,
		}
		handleAddCache(item);
	}, [cacheKey]);

	useImperativeHandle(ref, () => ({
		handleRefreshCache,
		handleRemoveCache,
	}));

	return (
		<div ref={containerRef} className={cn("size-full", className)}>
			{cachedItems?.map((item) =>
				item.refreshing ? (
					<Fragment key={item.key}>
						{
							refreshRender ? refreshRender?.(item) : null
						}
					</Fragment>
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
