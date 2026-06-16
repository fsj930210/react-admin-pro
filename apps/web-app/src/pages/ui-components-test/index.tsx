import { Anchor, type AnchorItem } from "@rap/components-ui/anchor";
import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { ActionBarDemo } from "./-action-bar-demo";
import { AngleSliderDemo } from "./-angle-slider-demo";
import { BannerDemo } from "./-banner-demo";
import { BaseComponentsDemo } from "./-base-components-demo";
import { ColorPickerDemo } from "./-color-picker-demo";
import { DataEditorDemo } from "./-data-editor-demo";
import { DataDisplayDemo } from "./-data-display-demo";
import { FeedbackNavigationDemo } from "./-feedback-navigation-demo";
import { FormControlsDemo } from "./-form-controls-demo";
import { InteractionLayerDemo } from "./-interaction-layer-demo";
import { LayoutMediaDemo } from "./-layout-media-demo";
import { OverlayMenuDemo } from "./-overlay-menu-demo";
import { SelectorTransferDemo } from "./-selector-transfer-demo";
import { StructureDemo } from "./-structure-demo";
import { TourDemo } from "./-tour-demo";

export const Route = createFileRoute("/ui-components-test/")({
  component: RouteComponent,
});

const anchorItems: AnchorItem[] = [
  { key: "feedback", title: "Feedback", target: "#feedback" },
  { key: "forms", title: "Forms", target: "#forms" },
  { key: "display", title: "Display", target: "#display" },
  { key: "workbench", title: "Workbench", target: "#workbench" },
];

function RouteComponent() {
  return (
    <main className="min-h-screen bg-muted/20 px-6 py-8 text-foreground md:pl-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="space-y-2 border-b pb-6">
          <h1 className="font-semibold text-3xl">UI Component Lab</h1>
          <p className="text-muted-foreground text-sm">
            Focused runtime demos for changed UI components, grouped by how a reviewer checks them.
          </p>
        </header>

        <Anchor
          items={anchorItems}
          direction="horizontal"
          offset={96}
          className="sticky top-0 z-20 border-b bg-background/95 py-3 backdrop-blur"
        />

        <TestSection
          id="feedback"
          title="Feedback And Navigation"
          description="Banners, tours, empty states, and navigation primitives."
        >
          <TestPanel title="ActionBar">
            <ActionBarDemo />
          </TestPanel>
          <TestPanel title="Banner">
            <BannerDemo />
          </TestPanel>
          <TestPanel title="Tour">
            <TourDemo />
          </TestPanel>
          <TestPanel title="Navigation">
            <FeedbackNavigationDemo />
          </TestPanel>
        </TestSection>

        <TestSection
          id="forms"
          title="Forms And Inputs"
          description="Editable values, uploads, grouped inputs, time input, tags, and field wrappers."
        >
          <TestPanel title="AngleSlider">
            <AngleSliderDemo />
          </TestPanel>
          <TestPanel title="ColorPicker">
            <ColorPickerDemo />
          </TestPanel>
          <TestPanel title="Form Workflows">
            <FormControlsDemo />
          </TestPanel>
        </TestSection>

        <TestSection
          id="display"
          title="Display And Data"
          description="Static display primitives, charts, media, tables, tree data, and editor surfaces."
        >
          <TestPanel title="Foundations">
            <BaseComponentsDemo />
          </TestPanel>
          <TestPanel title="Display">
            <DataDisplayDemo />
          </TestPanel>
          <TestPanel title="Media Layout">
            <LayoutMediaDemo />
          </TestPanel>
          <TestPanel title="Data And Editor">
            <DataEditorDemo />
          </TestPanel>
        </TestSection>

        <TestSection
          id="workbench"
          title="Interaction Workbench"
          description="Menus, overlays, scroll-aware controls, transfer lists, sidebars, sorting, and step flows."
        >
          <TestPanel title="Overlay Controls">
            <OverlayMenuDemo />
          </TestPanel>
          <TestPanel title="Layer And Selection States">
            <InteractionLayerDemo />
          </TestPanel>
          <TestPanel title="Selector And Transfer">
            <SelectorTransferDemo />
          </TestPanel>
          <TestPanel title="Sidebar, Sortable, Stepper">
            <StructureDemo />
          </TestPanel>
        </TestSection>
      </div>
    </main>
  );
}

function TestSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-20">
      <div className="space-y-1">
        <h2 className="font-semibold text-xl">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">{children}</div>
    </section>
  );
}

function TestPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border bg-background shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="font-medium text-base">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
