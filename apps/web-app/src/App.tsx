import { Toaster } from "@rap/components-base/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, ErrorComponent, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "@bprogress/core/css";
import { BProgress } from "@bprogress/core";
import ThemeProvider from "@rap/components-ui/theme-provider";
import { useEventEmitter } from "ahooks";
import { APP_BASE_PATH } from "@/config";
import { type AppEvent, AppProvider } from "./app-context";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
			retry: 0,
		},
		mutations: {
			retry: 0,
		},
	},
});

const router = createRouter({
	routeTree,
	basepath: APP_BASE_PATH, // Set the base path for the router
	defaultErrorComponent: ({ error }: any) => <ErrorComponent error={error} />,
	context: {
		queryClient,
	},
	defaultPreload: "intent",
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
});

let isNavigating = false;

router.subscribe("onBeforeNavigate", () => {
	if (!isNavigating) {
		isNavigating = true;
		BProgress.start();
	}
});

router.subscribe("onResolved", () => {
	if (isNavigating) {
		isNavigating = false;
		BProgress.done();
	}
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
const App = () => {
	const eventBus = useEventEmitter<AppEvent<unknown>>();
	return (
		<div className="size-full overflow-x-hidden">
			<AppProvider eventBus={eventBus}>
				<ThemeProvider id="app" className="size-full">
					<QueryClientProvider client={queryClient}>
						<RouterProvider router={router} />
					</QueryClientProvider>
					<Toaster />
				</ThemeProvider>
			</AppProvider>
		</div>
	);
};

export default App;
