import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@rap/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";

function Command({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  );
}

interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  contentClassName?: string;
  commandClassName?: string;
  closable?: boolean;
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  contentClassName,
  commandClassName,
  closable = false,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn("overflow-hidden p-0", contentClassName)} closable={closable}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command className={commandClassName}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

interface CommandInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  onValueChange?: (value: string) => void;
  wrapperClassName?: string;
  icon?: React.ReactNode;
}

function CommandInput({
  className,
  wrapperClassName,
  icon = <Search className="size-4 shrink-0 opacity-50" />,
  onChange,
  onValueChange,
  ...props
}: CommandInputProps & {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(event.target.value);
    onChange?.(event);
  };

  return (
    <div
      data-slot="command-input-wrapper"
      className={cn("flex h-10 items-center gap-2 border-b px-3", wrapperClassName)}
    >
      {icon}
      <input
        data-slot="command-input"
        className={cn(
          "flex h-full w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-list"
      className={cn("max-h-[300px] overflow-x-hidden overflow-y-auto", className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

interface CommandGroupProps extends React.ComponentProps<"div"> {
  heading?: React.ReactNode;
}

function CommandGroup({ className, heading, children, ...props }: CommandGroupProps) {
  return (
    <div data-slot="command-group" className={cn("overflow-hidden p-1", className)} {...props}>
      {heading && (
        <div
          data-slot="command-group-heading"
          className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
        >
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}

interface CommandItemProps extends Omit<React.ComponentProps<"button">, "onSelect"> {
  value?: string;
  onSelect?: (value: string) => void;
}

function CommandItem({ className, value = "", onClick, onSelect, ...props }: CommandItemProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      onSelect?.(value);
    }
  };

  return (
    <button
      type="button"
      data-slot="command-item"
      data-value={value}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
