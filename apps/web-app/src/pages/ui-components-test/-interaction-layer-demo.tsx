import { Button } from "@rap/components-ui/button";
import { DirectionProvider } from "@rap/components-ui/direction";
import {
  FloatingLayer,
  FloatingLayerContent,
  FloatingLayerRoot,
  FloatingLayerTrigger,
} from "@rap/components-ui/floating-layer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@rap/components-ui/hover-card";
import { Listbox, ListboxItem, ListboxItemIndicator } from "@rap/components-ui/listbox";
import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
  MentionLabel,
} from "@rap/components-ui/mention";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@rap/components-ui/popover";
import { ScrollArea } from "@rap/components-ui/scroll-area";
import {
  ScrollSpy,
  ScrollSpyLink,
  ScrollSpyNav,
  ScrollSpySection,
  ScrollSpyViewport,
} from "@rap/components-ui/scroll-spy";
import {
  SelectionToolbar,
  SelectionToolbarItem,
  SelectionToolbarSeparator,
} from "@rap/components-ui/selection-toolbar";
import { Space } from "@rap/components-ui/space";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@rap/components-ui/tooltip";
import { Bold, Italic } from "lucide-react";

export function InteractionLayerDemo() {
  return (
    <div className="grid gap-5">
      <TooltipProvider>
        <div className="rounded-md border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-medium text-sm">Floating Feedback</h4>
              <p className="text-muted-foreground text-xs">
                Hover and click each trigger to inspect portal positioning.
              </p>
            </div>
          </div>
          <Space className="flex-wrap" direction="horizontal" align="start">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Quick action details</TooltipContent>
            </Tooltip>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline">Hover card</Button>
              </HoverCardTrigger>
              <HoverCardContent>Alex reviewed 8 components this week.</HoverCardContent>
            </HoverCard>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Publish checklist</PopoverTitle>
                  <PopoverDescription>
                    Confirm keyboard, hover, and mobile states.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
            <FloatingLayerRoot>
              <FloatingLayerTrigger asChild>
                <Button variant="outline">Floating layer</Button>
              </FloatingLayerTrigger>
              <FloatingLayerContent className="rounded-md border bg-popover p-3 shadow-md">
                Floating content anchored to the trigger.
              </FloatingLayerContent>
            </FloatingLayerRoot>
          </Space>
          <FloatingLayer className="mt-4 rounded-md border bg-background p-3 text-sm">
            Controlled layer preview stays inside the demo area.
          </FloatingLayer>
        </div>
      </TooltipProvider>

      <div className="rounded-md border">
        <div className="border-b px-4 py-3">
          <h4 className="font-medium text-sm">Scroll Spy With Text Selection</h4>
          <p className="text-muted-foreground text-xs">
            The left rail tracks the active section while selected text exposes the toolbar.
          </p>
        </div>
        <ScrollSpy className="grid h-72 grid-cols-[132px_1fr] overflow-hidden">
          <ScrollSpyNav className="border-r bg-muted/30 p-3">
            <ScrollSpyLink value="alpha">Overview</ScrollSpyLink>
            <ScrollSpyLink value="beta">Details</ScrollSpyLink>
          </ScrollSpyNav>
          <ScrollSpyViewport className="overflow-auto p-4">
            <ScrollSpySection value="alpha" className="min-h-40 rounded-md bg-muted/60 p-4">
              Select this text to show the toolbar.
              <SelectionToolbar>
                <SelectionToolbarItem>
                  <Bold className="size-4" />
                </SelectionToolbarItem>
                <SelectionToolbarSeparator />
                <SelectionToolbarItem>
                  <Italic className="size-4" />
                </SelectionToolbarItem>
              </SelectionToolbar>
            </ScrollSpySection>
            <ScrollSpySection value="beta" className="mt-4 min-h-40 rounded-md bg-muted/60 p-4">
              The active section updates as the viewport scrolls.
            </ScrollSpySection>
          </ScrollSpyViewport>
        </ScrollSpy>
      </div>

      <DirectionProvider dir="ltr">
        <ScrollArea className="h-56 rounded-md border p-3">
          <Listbox defaultValue="one">
            <ListboxItem value="one">
              Daily report
              <ListboxItemIndicator />
            </ListboxItem>
            <ListboxItem value="two">
              Release checklist
              <ListboxItemIndicator />
            </ListboxItem>
          </Listbox>
          <Mention className="mt-4">
            <MentionInput placeholder="Mention a reviewer" />
            <MentionContent>
              <MentionLabel>People</MentionLabel>
              <MentionItem value="alice">Alice</MentionItem>
              <MentionItem value="bob">Bob</MentionItem>
            </MentionContent>
          </Mention>
        </ScrollArea>
      </DirectionProvider>
    </div>
  );
}
