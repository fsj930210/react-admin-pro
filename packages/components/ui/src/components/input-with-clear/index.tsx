import React from "react"
import { XCircle } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@rap/components-base/input-group"
import { cn } from "@rap/utils"

export interface InputWithClearProps
  extends Omit<React.ComponentProps<typeof InputGroupInput>, "value" | "onChange" | "defaultValue" | "ref"> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onClear?: () => void
  clearButtonClassName?: string
  inputClassName?: string
  ref?: React.RefObject<HTMLInputElement>
}

const InputWithClear = ({ 
  ref,
  value: controlledValue, 
  defaultValue, 
  onChange, 
  onClear,
  clearButtonClassName,
  inputClassName,
  className,
  ...props 
}: InputWithClearProps) => {
  const isControlled = controlledValue !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "")
  
  const currentValue = isControlled ? controlledValue : uncontrolledValue
  const hasValue = currentValue.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (isControlled) {
      onChange?.(newValue)
    } else {
      setUncontrolledValue(newValue)
      onChange?.(newValue)
    }
  }

  const handleClear = () => {
    if (isControlled) {
      onChange?.("")
    } else {
      setUncontrolledValue("")
      onChange?.("")
    }
    onClear?.()
  }

  return (
    <InputGroup className={className}>
      <InputGroupInput
        ref={ref}
        value={currentValue}
        onChange={handleChange}
        className={cn("pr-0", inputClassName)}
        {...props}
      />
      {hasValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className={cn("hover:bg-transparent", clearButtonClassName)}
            type="button"
          >
            <XCircle className="size-4 text-muted-foreground" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

InputWithClear.displayName = "InputWithClear"

export { InputWithClear }
