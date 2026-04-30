"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Check, ChevronDown, X } from "lucide-react"

import { cn } from "@rap/utils"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
} from "./input-group"
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "./popover"

function Combobox({ ...props }: React.ComponentProps<typeof CommandPrimitive>) {
	return <CommandPrimitive data-slot="combobox" {...props} />
}

function ComboboxValue({ ...props }: React.ComponentPropsWithRef<"span">) {
	return <span data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({
	className,
	children,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			data-slot="combobox-trigger"
			type="button"
			className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
			{...props}
		>
			{children}
			<ChevronDown
				data-slot="combobox-trigger-icon"
				className="pointer-events-none size-4 text-muted-foreground"
			/>
		</button>
	)
}

function ComboboxClear({ className, ...props }: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="combobox-clear"
			className={cn(className)}
			{...props}
		>
			<X className="pointer-events-none" />
		</button>
	)
}

function ComboboxInput({
	className,
	disabled = false,
	showTrigger = true,
	showClear = false,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
	showTrigger?: boolean
	showClear?: boolean
}) {
	return (
		<InputGroup className={cn("w-auto", className)}>
			<CommandPrimitive.Input
				data-slot="input-group-control"
				className={cn(
					"flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
					"h-9 min-w-0 px-2 py-1.5 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
				)}
				disabled={disabled}
				{...props}
			/>
			<InputGroupAddon align="inline-end">
				{showTrigger && (
					<InputGroupButton
						size="icon-xs"
						variant="ghost"
						data-slot="input-group-button"
						className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
						disabled={disabled}
					>
						<ComboboxTrigger />
					</InputGroupButton>
				)}
				{showClear && (
					<InputGroupButton
						size="icon-xs"
						variant="ghost"
						data-slot="combobox-clear"
						disabled={disabled}
					>
						<ComboboxClear />
					</InputGroupButton>
				)}
			</InputGroupAddon>
		</InputGroup>
	)
}

function ComboboxContent({
	children,
	className,
	open,
	onOpenChange,
	...props
}: React.ComponentProps<"div"> & {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}) {
	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverAnchor />
			<PopoverContent
				data-slot="combobox-content"
				className={cn("w-auto p-0", className)}
				align="start"
				sideOffset={6}
				{...props}
			>
				{children}
			</PopoverContent>
		</Popover>
	)
}

function ComboboxList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="combobox-list"
			className={cn(
				"max-h-[min(calc(var(--spacing(16))_*_6),calc(var(--available-height)_-_var(--spacing(9))))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0",
				className
			)}
			{...props}
		/>
	)
}

function ComboboxItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot="combobox-item"
			className={cn(
				"relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		>
			{children}
			<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
				<Check className="pointer-events-none size-4 pointer-coarse:size-5" />
			</span>
		</CommandPrimitive.Item>
	)
}

function ComboboxGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot="combobox-group"
			className={cn(className)}
			{...props}
		/>
	)
}

function ComboboxLabel({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="combobox-label"
			className={cn(
				"px-2 py-1.5 text-xs text-muted-foreground pointer-coarse:px-3 pointer-coarse:py-2 pointer-coarse:text-sm",
				className
			)}
			{...props}
		/>
	)
}

function ComboboxCollection({ ...props }: React.ComponentProps<"div">) {
	return <div data-slot="combobox-collection" {...props} />
}

function ComboboxEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="combobox-empty"
			className={cn(
				"hidden w-full justify-center py-2 text-center text-sm text-muted-foreground data-[empty=true]:flex",
				className
			)}
			{...props}
		/>
	)
}

function ComboboxSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="combobox-separator"
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	)
}

function ComboboxChips({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="combobox-chips"
			className={cn(
				"flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-[3px] has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1.5 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
				className
			)}
			{...props}
		/>
	)
}

function ComboboxChip({ className, children, closable = true, ...props }: React.ComponentProps<"div"> & { closable?: boolean }) {
	return (
		<div
			data-slot="combobox-chip"
			className={cn(
				"flex h-[calc(var(--spacing(5.5)))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
				className
			)}
			{...props}
		>
			{children}
			{closable && (
				<button
					type="button"
					data-slot="combobox-chip-remove"
					className="-ml-1 opacity-50 hover:opacity-100"
				>
					<X className="pointer-events-none size-3" />
				</button>
			)}
		</div>
	)
}

function ComboboxChipsInput({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type="text"
			data-slot="combobox-chip-input"
			className={cn("min-w-16 flex-1 rounded-sm border-0 bg-transparent p-1 outline-none focus:ring-0", className)}
			{...props}
		/>
	)
}

function ComboboxAnchor({ ...props }: React.ComponentProps<"div">) {
	return <PopoverAnchor data-slot="combobox-anchor" {...props} />
}

function useComboboxAnchor() {
	return React.useRef<HTMLDivElement | null>(null)
}

export {
	Combobox,
	ComboboxInput,
	ComboboxContent,
	ComboboxList,
	ComboboxItem,
	ComboboxGroup,
	ComboboxLabel,
	ComboboxCollection,
	ComboboxEmpty,
	ComboboxSeparator,
	ComboboxChips,
	ComboboxChip,
	ComboboxChipsInput,
	ComboboxTrigger,
	ComboboxValue,
	ComboboxAnchor,
	useComboboxAnchor,
}
