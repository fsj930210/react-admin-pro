import { cn } from "@rap/utils";
import { type ComponentProps, type Ref } from "react";

interface TableProps extends ComponentProps<"table"> {
  ref?: Ref<HTMLTableElement>;
}

function Table({ className, ref, ...props }: TableProps) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

interface TableHeaderProps extends ComponentProps<"thead"> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableHeader({ className, ref, ...props }: TableHeaderProps) {
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

interface TableBodyProps extends ComponentProps<"tbody"> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableBody({ className, ref, ...props }: TableBodyProps) {
  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

interface TableFooterProps extends ComponentProps<"tfoot"> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableFooter({ className, ref, ...props }: TableFooterProps) {
  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

interface TableRowProps extends ComponentProps<"tr"> {
  ref?: Ref<HTMLTableRowElement>;
}

function TableRow({ className, ref, ...props }: TableRowProps) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  );
}

interface TableHeadProps extends ComponentProps<"th"> {
  ref?: Ref<HTMLTableCellElement>;
}

function TableHead({ className, ref, ...props }: TableHeadProps) {
  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

interface TableCellProps extends ComponentProps<"td"> {
  ref?: Ref<HTMLTableCellElement>;
}

function TableCell({ className, ref, ...props }: TableCellProps) {
  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

interface TableCaptionProps extends ComponentProps<"caption"> {
  ref?: Ref<HTMLTableCaptionElement>;
}

function TableCaption({ className, ref, ...props }: TableCaptionProps) {
  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
