import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_layouts/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return <div>Hello "/_layout/dashborad/"!</div>;
}
