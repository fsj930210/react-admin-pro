import { Badge } from "@rap/components-ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import { DependencyDemo } from "./-dependency-demo";
import { DrawerDemo } from "./-drawer-demo";
import { FewFieldsDemo } from "./-few-fields-demo";
import { NoCollapseDemo } from "./-no-collapse-demo";
import { OneRowCollapseDemo } from "./-one-row-collapse-demo";
import { SidePanelDemo } from "./-side-panel-demo";
import { TwoRowCollapseDemo } from "./-two-row-collapse-demo";

export const Route = createFileRoute("/(layouts)/components/search/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-full bg-muted/20 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="pb-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Search</h1>
            <Badge variant="secondary">TanStack Form</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            A responsive search form with measured row collapse and composable fields.
          </p>
        </div>
        <FewFieldsDemo />
        <OneRowCollapseDemo />
        <TwoRowCollapseDemo />
        <NoCollapseDemo />
        <DependencyDemo />
        <SidePanelDemo />
        <DrawerDemo />
      </div>
    </div>
  );
}
