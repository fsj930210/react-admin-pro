import { createFileRoute } from "@tanstack/react-router";

import { AdvancedDemo } from "./-advanced-demo";
import { BasicDemo } from "./-basic-demo";
import { DependencyDemo } from "./-dependency-demo";
import { HiddenDemo } from "./-hidden-demo";
import { LayoutDemo } from "./-layout-demo";
import { NamePathDemo } from "./-name-path-demo";
import { PropsDemo } from "./-props-demo";
import { ScrollDemo } from "./-scroll-demo";

export const Route = createFileRoute("/(layouts)/components/form/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Form</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          High-level form examples based on TanStack Form with less field template code.
        </p>
      </div>

      <BasicDemo />
      <LayoutDemo />
      <NamePathDemo />
      <PropsDemo />
      <ScrollDemo />
      <HiddenDemo />
      <DependencyDemo />
      <AdvancedDemo />
    </div>
  );
}
