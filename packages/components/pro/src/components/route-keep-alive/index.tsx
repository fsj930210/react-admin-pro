import { Activity, useEffect, useImperativeHandle, useMemo, useReducer, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { cn } from "@rap/utils";
import { useLocation, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { getContentMatch, shouldKeepAlive } from "./route-match";
import { createTabRouter, getHrefFromLocation, isSameHref, loadTabRouter } from "./router";
import { restoreScrollSnapshot, saveScrollSnapshot } from "./scroll-cache";
import { TabRouteRenderer } from "./tab-route-renderer";
import type { RouteKeepAliveRef, ScrollSnapshot, TabRouterEntry } from "./types";

export type { RouteKeepAliveRef } from "./types";

interface RouteKeepAliveProps {
	className?: string;
	fallback?: ReactNode;
	layoutRouteId?: string;
	max?: number;
	ref?: RefObject<RouteKeepAliveRef | null>;
}

type TabsAction =
	| {
			type: "activate";
			activeHref: string;
			max: number;
			outerRouter: any;
			scrollSnapshot?: ScrollSnapshot;
			scrollSnapshotHref?: string | null;
	  }
	| { type: "attach-subscriptions"; subscribe: (tab: TabRouterEntry) => () => void }
	| { type: "refresh"; key: string; outerRouter: any }
	| { type: "remove"; keys: string[] };

function disposeTab(tab: TabRouterEntry) {
	tab.unsubscribe?.();
}

function createTabEntry(outerRouter: any, href: string): TabRouterEntry {
	const router = createTabRouter(outerRouter, href);
	const entry: TabRouterEntry = {
		id: href,
		href,
		router,
		activityKey: crypto.randomUUID(),
		lastActiveAt: Date.now(),
	};

	void loadTabRouter(router);

	return entry;
}

function updateScrollSnapshot(
	tabs: TabRouterEntry[],
	href: string | null | undefined,
	scrollSnapshot: ScrollSnapshot | undefined,
) {
	if (!href || !scrollSnapshot) return tabs;

	return tabs.map((tab) =>
		isSameHref(tab.href, href) ? { ...tab, scrollSnapshot } : tab,
	);
}

function tabsReducer(tabs: TabRouterEntry[], action: TabsAction): TabRouterEntry[] {
	if (action.type === "activate") {
		const withScroll = updateScrollSnapshot(
			tabs,
			action.scrollSnapshotHref,
			action.scrollSnapshot,
		);
		const existing = withScroll.find((tab) => isSameHref(tab.href, action.activeHref));
		const nextTabs = existing
			? withScroll.map((tab) =>
					isSameHref(tab.href, action.activeHref)
						? { ...tab, href: action.activeHref, lastActiveAt: Date.now() }
						: tab,
				)
			: [...withScroll, createTabEntry(action.outerRouter, action.activeHref)];

		if (nextTabs.length <= action.max) return nextTabs;

		const removableTabs = nextTabs
			.filter((tab) => !isSameHref(tab.href, action.activeHref))
			.sort((a, b) => a.lastActiveAt - b.lastActiveAt);
		const removeCount = nextTabs.length - action.max;
		const removeSet = new Set(removableTabs.slice(0, removeCount).map((tab) => tab.id));

		nextTabs.forEach((tab) => {
			if (removeSet.has(tab.id)) disposeTab(tab);
		});

		return nextTabs.filter((tab) => !removeSet.has(tab.id));
	}

	if (action.type === "attach-subscriptions") {
		return tabs.map((tab) => {
			if (tab.unsubscribe) return tab;
			return { ...tab, unsubscribe: action.subscribe(tab) };
		});
	}

	if (action.type === "refresh") {
		return tabs.map((tab) => {
			if (!isSameHref(tab.href, action.key)) return tab;
			disposeTab(tab);
			return createTabEntry(action.outerRouter, tab.href);
		});
	}

	if (action.type === "remove") {
		tabs.forEach((tab) => {
			if (action.keys.some((key) => isSameHref(tab.href, key))) {
				disposeTab(tab);
			}
		});

		return tabs.filter((tab) => !action.keys.some((key) => isSameHref(tab.href, key)));
	}

	return tabs;
}

export function RouteKeepAlive({
	className,
	fallback = null,
	layoutRouteId,
	max = 20,
	ref,
}: RouteKeepAliveProps) {
	const outerRouter = useRouter();
	const navigate = useNavigate();
	const outerState = useRouterState() as any;
	const outerMatches = useMemo(() => outerState.matches ?? [], [outerState.matches]);
	const location = useLocation();
	const activeHref = getHrefFromLocation(location);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const previousActiveHrefRef = useRef<string | null>(null);
	const syncFromTabRouterRef = useRef(false);
	const [tabs, dispatch] = useReducer(tabsReducer, []);
	const tabsRef = useRef<TabRouterEntry[]>(tabs);

	const activeContentMatch = useMemo(
		() => getContentMatch(outerMatches, outerRouter, layoutRouteId),
		[layoutRouteId, outerMatches, outerRouter],
	);
	const keepAlive = shouldKeepAlive(activeContentMatch, outerRouter);
	const activeTab = useMemo(
		() => tabs.find((tab) => isSameHref(tab.href, activeHref)),
		[tabs, activeHref],
	);
	const transientTab = useMemo(() => {
		if (!activeContentMatch || keepAlive) return null;
		return createTabEntry(outerRouter, activeHref);
	}, [activeContentMatch, activeHref, keepAlive, outerRouter]);

	useEffect(() => {
		if (!activeContentMatch || !keepAlive) {
			previousActiveHrefRef.current = null;
			return;
		}

		dispatch({
			type: "activate",
			activeHref,
			max,
			outerRouter,
			scrollSnapshot: saveScrollSnapshot(containerRef.current),
			scrollSnapshotHref: previousActiveHrefRef.current,
		});
		previousActiveHrefRef.current = activeHref;
	}, [activeContentMatch, activeHref, keepAlive, max, outerRouter]);

	useEffect(() => {
		restoreScrollSnapshot(containerRef.current, activeTab?.scrollSnapshot);
	}, [activeTab?.scrollSnapshot]);

	useEffect(() => {
		dispatch({
			type: "attach-subscriptions",
			subscribe: (tab) =>
				tab.router.subscribe?.("onResolved", () => {
					const href = getHrefFromLocation(tab.router.latestLocation);
					tab.href = href;
					tab.id = href;
					if (!isSameHref(activeHref, href)) {
						syncFromTabRouterRef.current = true;
						void navigate({ to: href, replace: true });
					}
				}) ?? (() => undefined),
		});
	}, [activeHref, navigate, tabs.length]);

	useEffect(() => {
		if (syncFromTabRouterRef.current) {
			syncFromTabRouterRef.current = false;
			return;
		}
		if (!activeTab || isSameHref(getHrefFromLocation(activeTab.router.latestLocation), activeHref)) {
			return;
		}
		void activeTab.router.navigate({ to: activeHref, replace: true });
	}, [activeHref, activeTab]);

	useEffect(() => {
		tabsRef.current = tabs;
	}, [tabs]);

	useEffect(() => {
		return () => {
			tabsRef.current.forEach(disposeTab);
		};
	}, []);

	useEffect(() => {
		return () => {
			if (transientTab) disposeTab(transientTab);
		};
	}, [transientTab]);

	useImperativeHandle(ref, () => ({
		refreshTab: (key: string) => {
			dispatch({ type: "refresh", key, outerRouter });
		},
		removeTabs: (keys: string[]) => {
			dispatch({ type: "remove", keys });
		},
	}));

	if (!activeContentMatch) {
		return <div ref={containerRef} className={cn("size-full overflow-y-auto", className)} />;
	}

	if (!keepAlive) {
		return (
			<div ref={containerRef} className={cn("size-full overflow-y-auto", className)}>
				{transientTab ? (
					<TabRouteRenderer fallback={fallback} layoutRouteId={layoutRouteId} tab={transientTab} />
				) : (
					fallback
				)}
			</div>
		);
	}

	return (
		<div ref={containerRef} className={cn("size-full overflow-y-auto", className)}>
			{activeTab ? null : fallback}
			{tabs.map((tab) => (
				<Activity
					key={`${tab.id}-${tab.activityKey}`}
					mode={isSameHref(tab.href, activeHref) ? "visible" : "hidden"}
				>
					<TabRouteRenderer fallback={fallback} layoutRouteId={layoutRouteId} tab={tab} />
				</Activity>
			))}
		</div>
	);
}
