import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const RichTextDemo = lazy(() => import("./-rich-text-demo"));

export const Route = createFileRoute("/(layouts)/components/rich-text/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense fallback={null}>
      <RichTextDemo />
    </Suspense>
  );
}
