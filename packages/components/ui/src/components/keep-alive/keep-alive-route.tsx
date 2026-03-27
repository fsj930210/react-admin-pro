import { useEffect, useImperativeHandle } from "react";
import { Activity, Fragment } from "react";
import type { CachedItem, KeepAliveProps } from "./types";
import { useKeepAlive } from "./use-keep-alive";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { cn } from "@rap/utils";
import React from "react";

export function KeepAliveRoute({
	className,
	children,
	excludes,
	includes,
	cacheKey,
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
	})
	const router = useRouter();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const matches = router.getMatchedRoutes(pathname);
	const Component = matches?.foundRoute?.options.component || null;

	useEffect(() => {
		const item: CachedItem = {
			key: uuidv4(),
			component: Component ? <Component /> : children ?? null,
			cacheKey: cacheKey,
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
			{cachedItems.map((item) =>
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
			{excludeItems.map((item) =>
				cacheKey === item.cacheKey ? (
					<Fragment key={item.key}>{item.component}</Fragment>
				) : null,
			)}
		</div>
	)
}
