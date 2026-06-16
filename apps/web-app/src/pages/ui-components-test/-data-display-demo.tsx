import { AspectRatio } from "@rap/components-ui/aspect-ratio";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@rap/components-ui/avatar";
import { AvatarGroup as MaskedAvatarGroup } from "@rap/components-ui/avatar-group";
import { Badge } from "@rap/components-ui/badge";
import { BadgeOverflow } from "@rap/components-ui/badge-overflow";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rap/components-ui/card";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRange,
  CircularProgressTrack,
  CircularProgressValueText,
} from "@rap/components-ui/circular-progress";
import { ColorSwatch } from "@rap/components-ui/color-swatch";
import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@rap/components-ui/gauge";
import { IconifyIcon, ImageIcon } from "@rap/components-ui/icon";
import { Kbd, KbdGroup } from "@rap/components-ui/kbd";
import { Loading } from "@rap/components-ui/loading";
import { Logo } from "@rap/components-ui/logo";
import { Progress } from "@rap/components-ui/progress";
import { Separator } from "@rap/components-ui/separator";
import { Skeleton } from "@rap/components-ui/skeleton";
import { Spinner } from "@rap/components-ui/spinner";
import { Status, StatusIndicator, StatusLabel } from "@rap/components-ui/status";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rap/components-ui/table";
import { Button } from "@rap/components-ui/button";

const badgeItems = [
  "React 19",
  "TanStack Router",
  "Radix UI",
  "Tailwind CSS",
  "pnpm",
  "Monorepo",
  "Components",
  "Hooks",
];

const avatars = [
  { src: "https://i.pravatar.cc/80?img=12", fallback: "AL" },
  { src: "https://i.pravatar.cc/80?img=32", fallback: "BX" },
  { src: "https://i.pravatar.cc/80?img=47", fallback: "CN" },
  { src: "https://i.pravatar.cc/80?img=56", fallback: "DW" },
  { src: "https://i.pravatar.cc/80?img=68", fallback: "EV" },
];

export function DataDisplayDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        <AvatarGroup>
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/80?img=15" alt="AB" />
            <AvatarFallback>AB</AvatarFallback>
            <AvatarBadge />
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+2</AvatarGroupCount>
        </AvatarGroup>
        <MaskedAvatarGroup max={4} size={48}>
          {avatars.map((avatar) => (
            <Avatar key={avatar.src} size="lg">
              <AvatarImage src={avatar.src} alt={avatar.fallback} />
              <AvatarFallback>{avatar.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </MaskedAvatarGroup>
        <BadgeOverflow
          items={badgeItems}
          lineCount={2}
          className="max-w-[320px]"
          renderBadge={(item) => <Badge variant="secondary">{item}</Badge>}
          renderOverflow={(count) => <Badge variant="outline">+{count}</Badge>}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment report</CardTitle>
          <CardDescription>Latest visual check for the admin workspace.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">
              View
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="text-sm">
          12 components reviewed, 3 need interaction checks.
        </CardContent>
        <CardFooter>
          <Button size="sm">Create task</Button>
        </CardFooter>
      </Card>

      <div className="flex flex-wrap items-center gap-8">
        <CircularProgress value={64} size={72} thickness={6}>
          <CircularProgressIndicator>
            <CircularProgressTrack />
            <CircularProgressRange />
          </CircularProgressIndicator>
          <CircularProgressValueText />
        </CircularProgress>
        <Gauge value={72} size={132} thickness={10} startAngle={-120} endAngle={120}>
          <GaugeIndicator>
            <GaugeTrack />
            <GaugeRange />
          </GaugeIndicator>
          <GaugeValueText />
          <GaugeLabel>CPU</GaugeLabel>
        </Gauge>
        <Progress value={48} className="w-40" />
        <Spinner />
      </div>

      <div className="flex flex-col gap-4">
        <Logo title="React Admin Pro" />
        <Separator />
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md bg-muted">
          <div className="flex size-full items-center justify-center text-sm">
            Preview area keeps its 16:9 ratio.
          </div>
        </AspectRatio>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Ready</Badge>
          <Status variant="success">
            <StatusIndicator />
            <StatusLabel>Online</StatusLabel>
          </Status>
          <ColorSwatch color="rgba(47,125,246,.65)" />
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <IconifyIcon icon="lucide:search" title="Search" />
          <ImageIcon src="/logo.svg" title="Logo icon" className="size-5" />
        </div>
        <Skeleton className="h-5 w-32" />
        <div className="h-20 rounded-md border">
          <Loading text="Loading" />
        </div>
      </div>

      <Table>
        <TableCaption>Component review status</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>ActionBar</TableCell>
            <TableCell>Rendered</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ColorPicker</TableCell>
            <TableCell>Interactive</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
