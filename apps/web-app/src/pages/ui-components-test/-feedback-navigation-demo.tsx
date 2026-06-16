import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@rap/components-ui/breadcrumb";
import { Button } from "@rap/components-ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@rap/components-ui/empty";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@rap/components-ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@rap/components-ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rap/components-ui/tabs";
import { Info } from "lucide-react";

export function FeedbackNavigationDemo() {
  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Component Review</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Accordion type="single" collapsible defaultValue="notes">
        <AccordionItem value="notes">
          <AccordionTrigger>Release notes</AccordionTrigger>
          <AccordionContent>
            Components in this page are grouped by usage area for quick visual checks.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <Button variant="outline">Toggle review summary</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-md bg-muted p-3 text-sm">
          Navigation primitives, empty states, and disclosure controls share the same spacing scale.
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="empty">
        <TabsList>
          <TabsTrigger value="empty">Empty</TabsTrigger>
          <TabsTrigger value="copy">Copy</TabsTrigger>
        </TabsList>
        <TabsContent value="empty">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Info className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No review items</EmptyTitle>
              <EmptyDescription>All components in this group have a demo entry.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline">
                Add checklist item
              </Button>
            </EmptyContent>
          </Empty>
        </TabsContent>
        <TabsContent value="copy" className="text-muted-foreground text-sm">
          Use empty states for recovery actions, not as a placeholder for missing demo code.
        </TabsContent>
      </Tabs>
    </div>
  );
}
