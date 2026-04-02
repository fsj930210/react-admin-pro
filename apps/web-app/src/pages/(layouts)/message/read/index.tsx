import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/message/read/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(layouts)/message/read/"!</div>;
}
