import { createRouter, RouterProvider } from "@tanstack/react-router";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  basepath: import.meta.env.RAP_WEB_APP_BASE_URL, // Set the base path for the router
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const App = () => {
  return (
    <div className="size-full">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
