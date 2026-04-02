import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/system/menu/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(layouts)/system/menu/"!</div>;
}
