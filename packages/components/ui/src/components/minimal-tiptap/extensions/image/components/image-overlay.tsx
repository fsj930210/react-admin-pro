import { Spinner } from "../../../components/spinner";
import { cn } from "@rap/utils";
import { memo } from "react";

export const ImageOverlay = memo(() => {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-center",
        "absolute inset-0 rounded bg-(--mt-overlay) opacity-100 transition-opacity"
      )}
    >
      <Spinner className="size-7" />
    </div>
  );
});

ImageOverlay.displayName = "ImageOverlay";
