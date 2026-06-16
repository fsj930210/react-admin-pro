import { Alert, AlertDescription, AlertTitle } from "@rap/components-ui/alert";
import { RaAnimator } from "@rap/components-ui/animator";
import { Button } from "@rap/components-ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@rap/components-ui/button-group";
import { Calendar } from "@rap/components-ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@rap/components-ui/carousel";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@rap/components-ui/chart";
import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
  CompareSliderLabel,
} from "@rap/components-ui/compare-slider";
import {
  ImageCard,
  ImageCardContent,
  ImageCardImage,
  ImageCardItem,
} from "@rap/components-ui/image-card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@rap/components-ui/input-otp";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@rap/components-ui/item";
import { Marquee, MarqueeContent, MarqueeEdge, MarqueeItem } from "@rap/components-ui/marquee";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@rap/components-ui/pagination";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeDownload,
  QRCodeOverlay,
  QRCodeSkeleton,
} from "@rap/components-ui/qr-code";
import { Scroller } from "@rap/components-ui/scroller";
import { Slider } from "@rap/components-ui/slider";
import { ThemeProvider, useTheme } from "@rap/components-ui/theme-provider";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { AlertCircle, Archive, Image, Plus } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
  { month: "Jan", desktop: 186 },
  { month: "Feb", desktop: 305 },
  { month: "Mar", desktop: 237 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function BaseComponentsDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 5, 16));

  return (
    <div className="flex flex-col gap-6">
      <Alert>
        <AlertCircle className="size-4" />
        <AlertTitle>Component coverage</AlertTitle>
        <AlertDescription>Base primitives are rendered here with visible states.</AlertDescription>
      </Alert>

      <div className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <ButtonGroup>
          <ButtonGroupText>Branch</ButtonGroupText>
          <Button variant="outline">main</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Sync</Button>
        </ButtonGroup>
      </div>

      <RaAnimator preset="fade-up" className="rounded-md border bg-muted p-3 text-sm">
        Animator fades this review note into place.
      </RaAnimator>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
      />

      <Carousel className="mx-auto w-full max-w-sm">
        <CarouselContent>
          {[1, 2, 3].map((item) => (
            <CarouselItem key={item}>
              <div className="flex h-32 items-center justify-center rounded-md border bg-muted text-sm">
                Slide {item}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <ChartContainer config={chartConfig} className="h-56 w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        </BarChart>
      </ChartContainer>

      <CompareSlider className="h-48 overflow-hidden rounded-md border">
        <CompareSliderBefore>
          <div className="flex h-full items-center justify-center bg-muted text-sm">Before</div>
        </CompareSliderBefore>
        <CompareSliderAfter>
          <div className="flex h-full items-center justify-center bg-primary/15 text-sm">After</div>
        </CompareSliderAfter>
        <CompareSliderLabel side="before">Before</CompareSliderLabel>
        <CompareSliderLabel side="after">After</CompareSliderLabel>
        <CompareSliderHandle />
      </CompareSlider>

      <div className="grid gap-4 lg:grid-cols-2">
        <ImageCard>
          <ImageCardItem>
            <ImageCardImage
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=480&auto=format&fit=crop"
              alt="Workspace"
              ratio={16 / 9}
              fit="cover"
            />
            <ImageCardContent>Workspace screenshot card</ImageCardContent>
          </ImageCardItem>
        </ImageCard>

        <ItemGroup>
          <Item>
            <ItemMedia variant="icon">
              <Archive className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemHeader>
                <ItemTitle>Review archive</ItemTitle>
                <ItemActions>
                  <Button size="sm" variant="outline">
                    Open
                  </Button>
                </ItemActions>
              </ItemHeader>
              <ItemDescription>
                Reusable item layout with media, content, and actions.
              </ItemDescription>
              <ItemFooter className="text-muted-foreground text-xs">Updated today</ItemFooter>
            </ItemContent>
          </Item>
          <ItemSeparator />
        </ItemGroup>
      </div>

      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <Marquee className="relative overflow-hidden rounded-md border py-3">
        <MarqueeEdge side="left" />
        <MarqueeContent>
          {["Design", "DataGrid", "Tree", "Editor"].map((item) => (
            <MarqueeItem key={item} className="mx-3 rounded-md bg-muted px-3 py-1 text-sm">
              {item}
            </MarqueeItem>
          ))}
        </MarqueeContent>
        <MarqueeEdge side="right" />
      </Marquee>

      <div className="grid gap-4 lg:grid-cols-2">
        <QRCode value="https://react-admin-pro.local/rap-web-app/ui-components-test" size={132}>
          <QRCodeCanvas />
          <QRCodeSkeleton />
          <QRCodeOverlay className="size-8">
            <Image className="size-4" />
          </QRCodeOverlay>
          <QRCodeDownload format="png" className="mt-2" />
        </QRCode>

        <div className="flex flex-col gap-4">
          <Scroller orientation="horizontal" withNavigation className="max-w-full">
            <div className="flex gap-2">
              {Array.from({ length: 8 }, (_, index) => (
                <Button key={index} variant="outline" className="shrink-0">
                  Item {index + 1}
                </Button>
              ))}
            </div>
          </Scroller>
          <Slider defaultValue={[35]} max={100} step={1} />
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <Choose>
        <When condition>
          <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
            <Plus className="size-4" />
            Conditional helper rendered the first matching branch.
          </div>
        </When>
        <Otherwise>Fallback branch</Otherwise>
      </Choose>

      <ThemeProvider
        scope="local"
        defaultTheme="light"
        themes={["light", "dark"]}
        storageKey="ui-components-test-theme"
        className="rounded-md border p-3"
      >
        <ThemePreview />
      </ThemeProvider>
    </div>
  );
}

function ThemePreview() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span>Local theme: {resolvedTheme}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setTheme((theme) => (theme === "dark" ? "light" : "dark"))}
      >
        Toggle theme
      </Button>
    </div>
  );
}
