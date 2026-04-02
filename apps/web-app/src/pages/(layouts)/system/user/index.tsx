import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/system/user/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(layouts)/system/user/"!</div>;
}
