import {
  ImageCardGrid,
  ImageCardGridContent,
  ImageCardGridImage,
  ImageCardGridItem,
} from "@rap/components-ui/image-card-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import { Badge } from "@rap/components-ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, MapPin, Clock3 } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/(layouts)/components/image-card-grid/")({
  component: RouteComponent,
});

type CaptureItem = {
  id: string;
  camera: string;
  location: string;
  time: string;
  ratioLabel: string;
  status: "normal" | "warning" | "offline";
  image: string;
};

const statusClassName = {
  normal: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
  offline: "bg-slate-500/14 text-slate-700 dark:text-slate-300",
} satisfies Record<CaptureItem["status"], string>;

function createFrameSvg({
  width,
  height,
  label,
  color,
}: {
  width: number;
  height: number;
  label: string;
  color: string;
}) {
  const fontSize = Math.max(16, Math.round(Math.min(width, height) / 8));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${color}"/>
        <stop offset="1" stop-color="#101828"/>
      </linearGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M32 0H0V32" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="10" fill="none" stroke="rgba(255,255,255,.58)" stroke-width="3"/>
    <circle cx="${width * 0.22}" cy="${height * 0.28}" r="${Math.min(width, height) * 0.08}" fill="rgba(255,255,255,.72)"/>
    <path d="M${width * 0.08} ${height * 0.78} L${width * 0.32} ${height * 0.5} L${width * 0.52} ${height * 0.7} L${width * 0.72} ${height * 0.46} L${width * 0.92} ${height * 0.78} Z" fill="rgba(255,255,255,.32)"/>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const captures: CaptureItem[] = [
  {
    id: "cap-001",
    camera: "Gate A Camera",
    location: "North entrance checkpoint",
    time: "2026-06-04 09:14:22",
    ratioLabel: "16:9",
    status: "normal",
    image: createFrameSvg({ width: 640, height: 360, label: "16:9", color: "#2563eb" }),
  },
  {
    id: "cap-002",
    camera: "Elevator Hall",
    location: "Tower B floor 12 corridor",
    time: "2026-06-04 09:18:07",
    ratioLabel: "3:4",
    status: "warning",
    image: createFrameSvg({ width: 360, height: 480, label: "3:4", color: "#7c3aed" }),
  },
  {
    id: "cap-003",
    camera: "Parking Lane",
    location: "Vehicle lane east exit with a long location name",
    time: "2026-06-04 09:22:41",
    ratioLabel: "4:3",
    status: "normal",
    image: createFrameSvg({ width: 520, height: 390, label: "4:3", color: "#0891b2" }),
  },
  {
    id: "cap-004",
    camera: "Warehouse Door",
    location: "Loading area C",
    time: "2026-06-04 09:25:36",
    ratioLabel: "1:1",
    status: "offline",
    image: createFrameSvg({ width: 420, height: 420, label: "1:1", color: "#475569" }),
  },
  {
    id: "cap-005",
    camera: "Lobby Face",
    location: "Main lobby reception",
    time: "2026-06-04 09:31:09",
    ratioLabel: "9:16",
    status: "normal",
    image: createFrameSvg({ width: 360, height: 640, label: "9:16", color: "#059669" }),
  },
  {
    id: "cap-006",
    camera: "Meeting Area",
    location: "Open workspace west",
    time: "2026-06-04 09:35:58",
    ratioLabel: "21:9",
    status: "warning",
    image: createFrameSvg({ width: 840, height: 360, label: "21:9", color: "#d97706" }),
  },
  {
    id: "cap-007",
    camera: "Server Room",
    location: "Restricted zone inner door",
    time: "2026-06-04 09:39:20",
    ratioLabel: "5:4",
    status: "normal",
    image: createFrameSvg({ width: 500, height: 400, label: "5:4", color: "#0f766e" }),
  },
  {
    id: "cap-008",
    camera: "South Gate",
    location: "Visitor passage",
    time: "2026-06-04 09:42:13",
    ratioLabel: "2:3",
    status: "normal",
    image: createFrameSvg({ width: 360, height: 540, label: "2:3", color: "#be123c" }),
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CaptureCard({ item, imageFit }: { item: CaptureItem; imageFit?: "contain" | "cover" }) {
  return (
    <ImageCardGridItem>
      <ImageCardGridImage src={item.image} alt={item.camera} fit={imageFit} />
      <ImageCardGridContent className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 font-medium">
            <Camera className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{item.camera}</span>
          </div>
          <Badge className={statusClassName[item.status]} variant="secondary">
            {item.ratioLabel}
          </Badge>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
          <Clock3 className="size-3.5 shrink-0" />
          <span className="truncate">{item.time}</span>
        </div>
        <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
      </ImageCardGridContent>
    </ImageCardGridItem>
  );
}

function ContainDemo() {
  return (
    <Section
      title="Capture List"
      description="Default contain thumbnails keep every original image complete while all cards remain the same size."
    >
      <ImageCardGrid itemWidth={240} contentHeight={92} gap={16}>
        {captures.map((item) => (
          <CaptureCard key={item.id} item={item} />
        ))}
      </ImageCardGrid>
    </Section>
  );
}

function FitComparisonDemo() {
  return (
    <Section
      title="Contain And Cover"
      description="The same image set can switch between complete thumbnails and filled visual cards."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-medium">contain</div>
          <ImageCardGrid itemWidth={180} contentHeight={72} gap={12}>
            {captures.slice(0, 4).map((item) => (
              <CaptureCard key={item.id} item={item} />
            ))}
          </ImageCardGrid>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium">cover</div>
          <ImageCardGrid itemWidth={180} contentHeight={72} gap={12} imageFit="cover">
            {captures.slice(0, 4).map((item) => (
              <CaptureCard key={item.id} imageFit="cover" item={item} />
            ))}
          </ImageCardGrid>
        </div>
      </div>
    </Section>
  );
}

function WidthDemo() {
  return (
    <Section
      title="Elastic Width"
      description="Only itemWidth is required. The grid derives a small elastic range and recalculates columns from the container width."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="text-sm font-medium">Narrow container</div>
          <ImageCardGrid itemWidth={150} contentHeight={68} gap={10}>
            {captures.slice(0, 6).map((item) => (
              <CaptureCard key={item.id} item={item} />
            ))}
          </ImageCardGrid>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-medium">Wide container</div>
          <ImageCardGrid itemWidth={220} contentHeight={82} gap={14} maxColumns={4}>
            {captures.slice(0, 6).map((item) => (
              <CaptureCard key={item.id} item={item} />
            ))}
          </ImageCardGrid>
        </div>
      </div>
    </Section>
  );
}

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">ImageCardGrid</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground text-sm">
          A responsive image-card grid for capture lists, asset galleries, and thumbnail metadata
          cards.
        </p>
      </div>

      <ContainDemo />
      <FitComparisonDemo />
      <WidthDemo />
    </div>
  );
}
