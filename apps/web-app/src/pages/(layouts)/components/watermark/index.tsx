import { Badge } from "@rap/components-ui/badge";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import { Watermark, type WatermarkTamperEvent } from "@rap/components-ui/watermark";
import { createFileRoute } from "@tanstack/react-router";
import { Image, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/(layouts)/components/watermark/")({
  component: RouteComponent,
});

function DocumentPreview() {
  const [tamperCount, setTamperCount] = useState(0);
  const [lastTamperType, setLastTamperType] = useState<WatermarkTamperEvent["type"] | null>(null);

  const content = useMemo(() => ["React Admin Pro", "Internal Use Only"], []);

  const removeWatermarkLayer = () => {
    document.querySelector("[data-demo-watermark=document] [data-slot=watermark-layer]")?.remove();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Container Watermark</CardTitle>
          <CardDescription>
            Watermark a bounded business area without covering the page.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Tamper: {tamperCount}</Badge>
          {lastTamperType ? <Badge variant="outline">{lastTamperType}</Badge> : null}
          <Button type="button" variant="outline" size="sm" onClick={removeWatermarkLayer}>
            <Trash2 className="size-4" />
            Remove layer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Watermark
          data-demo-watermark="document"
          className="overflow-hidden rounded-lg border bg-background"
          content={content}
          gap={[88, 72]}
          width={150}
          height={72}
          opacity={0.95}
          guard={{
            interval: 800,
            onTamper: (event) => {
              setLastTamperType(event.type);
              setTamperCount((count) => count + 1);
            },
          }}
        >
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Quarterly Revenue Review</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Draft report with sensitive customer and contract information.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Pipeline", "$2.48M"],
                  ["Renewal", "94.2%"],
                  ["Risk", "Medium"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border bg-muted/30 p-4">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="mt-2 text-2xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 rounded-md border p-4 text-sm leading-6 text-muted-foreground">
                <p>
                  The preview keeps the watermark inside the report container. The layer is rendered
                  as a canvas background and the guard restores it after removal.
                </p>
                <p>
                  Inline styles and MutationObserver cover the common accidental or manual deletion
                  paths used in admin preview screens.
                </p>
              </div>
            </div>
            <div className="rounded-md border bg-muted/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="size-4 text-emerald-600" />
                Guard enabled
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <span>Removal observer</span>
                  <span className="font-medium text-foreground">On</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Style observer</span>
                  <span className="font-medium text-foreground">On</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Interval fallback</span>
                  <span className="font-medium text-foreground">800ms</span>
                </div>
              </div>
            </div>
          </div>
        </Watermark>
      </CardContent>
    </Card>
  );
}

function ImagePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Area Watermark</CardTitle>
        <CardDescription>
          Use the same component over image previews or media cards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Watermark
          className="overflow-hidden rounded-lg border"
          content="Preview Only"
          font={{ color: "rgba(255, 255, 255, 0.55)", fontSize: 18, fontWeight: 600 }}
          gap={[64, 64]}
          width={140}
          height={70}
          rotate={-18}
        >
          <div className="relative min-h-[320px] overflow-hidden bg-[linear-gradient(135deg,#0f766e,#2563eb_48%,#111827)] p-6 text-white">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-black/20" />
            <div className="relative flex h-full min-h-[272px] flex-col justify-between">
              <div className="flex items-center gap-2">
                <Image className="size-5" />
                <span className="text-sm font-medium">Product Screenshot</span>
              </div>
              <div>
                <div className="max-w-xl text-3xl font-semibold">Analytics Workspace</div>
                <p className="mt-3 max-w-xl text-sm text-white/75">
                  A visual preview area can carry the same repeatable watermark without changing the
                  image asset itself.
                </p>
              </div>
            </div>
          </div>
        </Watermark>
      </CardContent>
    </Card>
  );
}

function FullscreenPreview() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Fullscreen Watermark</CardTitle>
          <CardDescription>
            Mount a page-level watermark for admin systems and previews.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant={enabled ? "default" : "outline"}
          onClick={() => setEnabled((value) => !value)}
        >
          {enabled ? "Disable fullscreen" : "Enable fullscreen"}
        </Button>
      </CardHeader>
      <CardContent>
        {enabled ? (
          <Watermark
            fullscreen
            content={["React Admin Pro", "2026-06-05"]}
            font={{ color: "rgba(15, 23, 42, 0.12)", fontSize: 18, fontWeight: 600 }}
            gap={[120, 96]}
            width={180}
            height={80}
          />
        ) : null}
        <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
          Fullscreen mode uses fixed positioning and can be mounted once near the app layout or
          enabled only for sensitive routes.
        </div>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Watermark</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Canvas-based text watermark with container, media, fullscreen, and guard scenarios.
        </p>
      </div>
      <DocumentPreview />
      <div className="grid gap-6 xl:grid-cols-2">
        <ImagePreview />
        <FullscreenPreview />
      </div>
    </div>
  );
}
