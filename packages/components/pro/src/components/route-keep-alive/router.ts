import { createMemoryHistory, createRouter } from "@tanstack/react-router";

export function getHrefFromLocation(location: {
	pathname: string;
	searchStr?: string;
	search?: unknown;
	hash?: string;
}) {
	return `${location.pathname}${location.searchStr ?? ""}${location.hash ?? ""}`;
}

export function normalizeHref(href: string) {
	return href || "/";
}

export function createTabRouter(outerRouter: any, href: string) {
	const history = createMemoryHistory({
		initialEntries: [normalizeHref(href)],
	});

	return createRouter({
		routeTree: outerRouter.routeTree,
		history,
		basepath: outerRouter.options.basepath,
		defaultErrorComponent: outerRouter.options.defaultErrorComponent,
		defaultPendingComponent: outerRouter.options.defaultPendingComponent,
		defaultNotFoundComponent: outerRouter.options.defaultNotFoundComponent,
		defaultComponent: outerRouter.options.defaultComponent,
		defaultPreload: outerRouter.options.defaultPreload,
		defaultPreloadStaleTime: outerRouter.options.defaultPreloadStaleTime,
		defaultStructuralSharing: outerRouter.options.defaultStructuralSharing,
		context: outerRouter.options.context,
		scrollRestoration: false,
	});
}

export async function loadTabRouter(router: any) {
	try {
		await router.load();
	} catch (error) {
		console.error(error);
	}
}

export function isSameHref(a: string, b: string) {
	return normalizeHref(a).replace(/\/$/, "") === normalizeHref(b).replace(/\/$/, "");
}
