import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import type { PickerPreset } from "./types";

interface PickerPresetsProps {
  presets?: PickerPreset[];
  onPick: (preset: PickerPreset) => void;
  className?: string;
}

function PickerPresets(props: PickerPresetsProps) {
  const { presets, onPick, className } = props;

  if (!presets?.length) {
    return null;
  }

  return (
    <div className={cn("flex min-w-32 flex-col gap-1 border-r p-2", className)}>
      {presets.map((preset) => (
        <Button
          key={String(preset.label)}
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 justify-start px-2"
          disabled={preset.disabled}
          onClick={() => onPick(preset)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}

export { PickerPresets };
