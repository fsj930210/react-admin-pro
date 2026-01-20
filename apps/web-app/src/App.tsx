import { createRouter, RouterProvider, ErrorComponent } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { Toaster } from '@rap/components-base/sonner'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import '@bprogress/core/css';
import { BProgress } from '@bprogress/core';

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
})

const router = createRouter({
	routeTree,
	basepath: import.meta.env.RAP_WEB_APP_BASE_URL, // Set the base path for the router
  defaultErrorComponent: ({ error }: any) => <ErrorComponent error={error} />,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

let isNavigating = false

router.subscribe('onBeforeNavigate', () => {
  if (!isNavigating) {
    isNavigating = true
    BProgress.start()
  }
})

router.subscribe('onResolved', () => {
  if (isNavigating) {
    isNavigating = false
    BProgress.done()
  }
})



// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
const App = () => {
	return (
		<div className="size-full overflow-x-hidden">
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
			<Toaster />
		</div>
	);
};

export default App;
