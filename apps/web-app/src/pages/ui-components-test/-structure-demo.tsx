import { Button } from "@rap/components-ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@rap/components-ui/sidebar";
import { Sortable } from "@rap/components-ui/sortable";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  StepperTitle,
  StepperTrigger,
} from "@rap/components-ui/stepper";
import { GripVertical } from "lucide-react";

const sortableItems = ["Backlog", "In review", "Ready"];

export function StructureDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SidebarProvider defaultOpen>
        <div className="min-h-56 rounded-md border">
          <SidebarTrigger />
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>Overview</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </div>
      </SidebarProvider>

      <Sortable.Root items={sortableItems}>
        <Sortable.List className="flex flex-col gap-2">
          {sortableItems.map((item) => (
            <Sortable.Item key={item} id={item} className="rounded-md border p-2">
              <Sortable.Handle className="mr-2 inline-flex">
                <GripVertical className="size-4" />
              </Sortable.Handle>
              {item}
            </Sortable.Item>
          ))}
        </Sortable.List>
      </Sortable.Root>

      <Stepper defaultValue="account">
        <StepperList>
          <Step name="account" title="Account" />
          <Step name="confirm" title="Confirm" />
        </StepperList>
        <StepperContent value="account">Choose the account used for this review.</StepperContent>
        <StepperContent value="confirm">Confirm the review before publishing.</StepperContent>
        <div className="mt-3 flex gap-2">
          <StepperPrev asChild>
            <Button size="sm" variant="outline">
              Prev
            </Button>
          </StepperPrev>
          <StepperNext asChild>
            <Button size="sm">Next</Button>
          </StepperNext>
        </div>
      </Stepper>
    </div>
  );
}

function Step({ name, title }: { name: string; title: string }) {
  return (
    <StepperItem value={name}>
      <StepperTrigger>
        <StepperIndicator />
        <span>
          <StepperTitle>{title}</StepperTitle>
          <StepperDescription>{name}</StepperDescription>
        </span>
      </StepperTrigger>
    </StepperItem>
  );
}
