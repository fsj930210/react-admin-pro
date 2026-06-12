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
    <div className={cn("flex flex-wrap gap-2 border-t p-2", className)}>
      {presets.map((preset) => (
        <Button
          key={String(preset.label)}
          type="button"
          variant="outline"
          size="sm"
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
