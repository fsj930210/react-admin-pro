import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@rap/components-ui/alert-dialog";
import { Button } from "@rap/components-ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@rap/components-ui/combobox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@rap/components-ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@rap/components-ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@rap/components-ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@rap/components-ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@rap/components-ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@rap/components-ui/navigation-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@rap/components-ui/sheet";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialLabel,
  SpeedDialTrigger,
} from "@rap/components-ui/speed-dial";
import { Toaster } from "@rap/components-ui/sonner";
import { Copy, Download, Plus, Settings, Trash2 } from "lucide-react";
import { type ReactNode } from "react";
import { toast } from "sonner";

const menuItems = ["Dashboard", "Components", "Settings"];

export function OverlayMenuDemo() {
  return (
    <div className="grid gap-5">
      <DemoBlock title="Modal Surfaces">
        <div className="grid gap-3 sm:grid-cols-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Alert dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete review?</AlertDialogTitle>
                <AlertDialogDescription>
                  This checks destructive confirmation layout.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish review</DialogTitle>
                <DialogDescription>
                  Dialogs use the same modal shell as product flows.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Review details</DrawerTitle>
                <DrawerDescription>
                  Drawer content should stay readable on mobile.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Save</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Sheet side panels host compact controls.</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <Button>Apply</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </DemoBlock>

      <DemoBlock title="Menus">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Dropdown actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ContextMenu>
              <ContextMenuTrigger className="rounded-md border bg-background px-3 py-2 text-sm">
                Right click target
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Open</ContextMenuItem>
                <ContextMenuItem>Copy link</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>

          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New review
                  <MenubarShortcut>Ctrl+N</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Export</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </DemoBlock>

      <DemoBlock title="Navigation And Command">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-3">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-64 gap-2 p-2">
                      {menuItems.map((item) => (
                        <NavigationMenuLink key={item} href="#" className="rounded-md p-2">
                          {item}
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Select defaultValue="components">
              <SelectTrigger>
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
              </SelectContent>
            </Select>

            <Combobox>
              <ComboboxTrigger>
                <ComboboxValue placeholder="Choose module" />
              </ComboboxTrigger>
              <ComboboxContent>
                <ComboboxInput placeholder="Search module" />
                <ComboboxList>
                  <ComboboxEmpty>No module found.</ComboboxEmpty>
                  {menuItems.map((item) => (
                    <ComboboxItem key={item} value={item.toLowerCase()}>
                      {item}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <Command className="rounded-md border">
            <CommandInput placeholder="Search command" />
            <CommandList>
              <CommandEmpty>No command found.</CommandEmpty>
              <CommandGroup heading="Actions">
                <CommandItem>
                  Open review
                  <CommandShortcut>Enter</CommandShortcut>
                </CommandItem>
                <CommandItem>Copy URL</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </DemoBlock>

      <DemoBlock title="Floating Action And Toast">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative h-36 rounded-md border bg-muted/20">
            <SpeedDial>
              <SpeedDialTrigger size="icon" className="absolute right-4 bottom-4 rounded-full">
                <Plus className="size-4" />
              </SpeedDialTrigger>
              <SpeedDialContent>
                <SpeedDialItem>
                  <SpeedDialLabel>Settings</SpeedDialLabel>
                  <SpeedDialAction>
                    <Settings className="size-4" />
                  </SpeedDialAction>
                </SpeedDialItem>
                <SpeedDialItem>
                  <SpeedDialLabel>Download</SpeedDialLabel>
                  <SpeedDialAction>
                    <Download className="size-4" />
                  </SpeedDialAction>
                </SpeedDialItem>
              </SpeedDialContent>
            </SpeedDial>
          </div>
          <Button variant="outline" onClick={() => toast.success("Sonner toast rendered")}>
            Show toast
          </Button>
        </div>
        <Toaster />
      </DemoBlock>
    </div>
  );
}

function DemoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border bg-muted/20">
      <div className="border-b px-4 py-3">
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
