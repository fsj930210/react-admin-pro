import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../../tooltip"
import { Toggle } from "../../toggle"
import { cn } from "@rap/utils"

interface ToolbarButtonProps extends React.ComponentProps<typeof Toggle> {
	isActive?: boolean
	tooltip?: string
	tooltipOptions?: React.ComponentProps<typeof TooltipPrimitive.Content>
}

export const ToolbarButton = ({
	isActive,
	children,
	tooltip,
	className,
	tooltipOptions,
	...props
}: ToolbarButtonProps) => {
	const toggleButton = (
		<Toggle className={cn({ "bg-accent": isActive }, className)} {...props}>
			{children}
		</Toggle>
	)

	if (!tooltip) {
		return toggleButton
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
			<TooltipContent {...tooltipOptions}>
				<div className="flex flex-col items-center text-center">{tooltip}</div>
			</TooltipContent>
		</Tooltip>
	)
}

ToolbarButton.displayName = "ToolbarButton"

export default ToolbarButton
