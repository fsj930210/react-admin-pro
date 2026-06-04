import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/message/unread/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(layouts)/message/unread/"!</div>;
}
