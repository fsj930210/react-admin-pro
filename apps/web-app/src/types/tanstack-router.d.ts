import "@tanstack/router-core";

declare module "@tanstack/router-core" {
	interface StaticDataRouteOption {
		keepAlive?: boolean;
	}
}
