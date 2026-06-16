import { Loader2Icon } from "lucide-react";

import { cn } from "@rap/utils";
import { type ComponentProps } from "react";

function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
