import { Slot } from "@radix-ui/react-slot";
import { cn } from "@rap/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

const inputVariants = cva(
	cn(
		"flex px-2 w-full rounded-md text-sm transition-all",
		"file:border-0 file:bg-transparent file:text-sm file:font-medium",
		"placeholder:text-muted-foreground focus-visible:outline-none",
		"disabled:cursor-not-allowed disabled:opacity-50",
		"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
		"aria-invalid:border-destructive",
	),
	{
		variants: {
			variant: {
				default:
					"border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring",
				underline:
					"border-b border-input bg-transparent px-0 focus-visible:border-primary rounded-none focus-visible:ring-0 focus-visible:outline-none transition-colors duration-200",
			},
			inputSize: {
				xs: "h-7 text-xs",
				sm: "h-8 text-sm",
				md: "h-9 text-sm",
				lg: "h-10 text-base",
				xl: "h-11 text-lg",
				"2xl": "h-12 text-xl",
			},
		},
		defaultVariants: {
			variant: "default",
			inputSize: "md",
		},
	},
);

export interface InputProps
	extends Omit<
			Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
			"prefix"
		>,
		VariantProps<typeof inputVariants> {
	asChild?: boolean;
	prefix?: React.ReactNode;
	suffix?: React.ReactNode;
}

function Input({
	className,
	variant,
	inputSize,
	asChild = false,
	type,
	prefix,
	suffix,
	...props
}: InputProps) {
	const Comp = asChild ? Slot : "input";

	const inputClassName = cn(
		inputVariants({ variant, inputSize, className }),
		prefix ? "pl-8" : "",
		suffix ? "pr-8" : "",
	);

	return (
		<div
			className="relative flex-items-center w-full"
			data-slot="input-wrapper"
		>
			{prefix}
			<Comp
				data-slot="input"
				type={type}
				className={inputClassName}
				{...props}
			/>
			{suffix}
		</div>
	);
}

export { Input, inputVariants };
