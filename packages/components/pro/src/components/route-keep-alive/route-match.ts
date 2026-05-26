const LAYOUT_ROUTE_ID = "/(layouts)";

export function getContentMatch(matches: any[], router: any, layoutRouteId = LAYOUT_ROUTE_ID) {
	const layoutIndex = matches.findIndex((match) => match.routeId === layoutRouteId);
	if (layoutIndex < 0) return null;

	const contentMatches = matches.slice(layoutIndex + 1);
	return (
		contentMatches.find((match) => {
			const route = router.routesById[match.routeId];
			return Boolean(route?.options?.component);
		}) ?? contentMatches[contentMatches.length - 1] ?? null
	);
}

export function shouldKeepAlive(match: any, router: any) {
	if (!match) return false;
	const route = router.routesById[match.routeId];
	return route?.options?.staticData?.keepAlive !== false;
}
