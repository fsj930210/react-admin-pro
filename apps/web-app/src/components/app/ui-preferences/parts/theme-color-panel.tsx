import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@rap/components-ui/color-picker";
import { cn } from "@rap/utils";
import { Check, Palette, RotateCcw } from "lucide-react";
import type { PrimaryColor, UIPreferences } from "@/config/ui-preferences";

const themeColorOptions: Array<{
  value: Exclude<PrimaryColor, "theme" | "default" | "custom">;
  label: string;
  color: string;
}> = [
  { value: "aurora", label: "极光青", color: "#00b8a9" },
  { value: "glacier", label: "冰川蓝", color: "#2f80ed" },
  { value: "mint", label: "薄荷绿", color: "#20c997" },
  { value: "lime", label: "新芽绿", color: "#84cc16" },
  { value: "amber", label: "琥珀金", color: "#f59f00" },
  { value: "coral", label: "珊瑚红", color: "#ff6b6b" },
  { value: "ruby", label: "赤晶红", color: "#e03131" },
  { value: "orchid", label: "兰花紫", color: "#ae3ec9" },
  { value: "indigo", label: "靛青蓝", color: "#4c6ef5" },
  { value: "graphite", label: "石墨灰", color: "#495057" },
  { value: "steel", label: "钢蓝灰", color: "#42637a" },
  { value: "sand", label: "岩砂棕", color: "#b08968" },
];

const colorButtonClassName =
  "flex h-12 w-full items-center justify-center rounded-md border border-border/70 bg-muted/20 transition-colors hover:border-primary/70 hover:bg-primary/10";

interface ThemeColorPanelProps {
  preferences: UIPreferences;
  updatePreferences: (recipe: (draft: UIPreferences) => void) => void;
}

export function ThemeColorPanel({ preferences, updatePreferences }: ThemeColorPanelProps) {
  const themeColorSelected =
    preferences.appearance.primaryColor === "theme" ||
    preferences.appearance.primaryColor === "default";

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">主题色</h3>
      <div className="grid grid-cols-3 gap-x-5 gap-y-3 max-[380px]:grid-cols-2">
        <div className="space-y-1.5">
          <button
            type="button"
            className={cn(colorButtonClassName, themeColorSelected && "border-foreground")}
            onClick={() =>
              updatePreferences((draft) => {
                draft.appearance.primaryColor = "theme";
              })
            }
          >
            <span className="flex size-5 items-center justify-center rounded-md bg-foreground text-background">
              {themeColorSelected ? (
                <Check className="size-3.5" />
              ) : (
                <RotateCcw className="size-3.5" />
              )}
            </span>
            <span className="sr-only">跟随主题</span>
          </button>
          <div className="truncate text-center text-xs text-muted-foreground">跟随主题</div>
        </div>

        {themeColorOptions.map((item) => {
          const selected = preferences.appearance.primaryColor === item.value;
          return (
            <div key={item.value} className="space-y-1.5">
              <button
                type="button"
                className={cn(colorButtonClassName, selected && "border-primary bg-primary/10")}
                onClick={() =>
                  updatePreferences((draft) => {
                    draft.appearance.primaryColor = item.value;
                  })
                }
              >
                <span
                  className="flex size-5 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {selected && <Check className="size-3.5" />}
                </span>
                <span className="sr-only">{item.label}</span>
              </button>
              <div className="truncate text-center text-xs text-muted-foreground">{item.label}</div>
            </div>
          );
        })}

        <div className="space-y-1.5">
          <ColorPicker
            value={preferences.appearance.customPrimaryColor}
            onValueChange={(value) =>
              updatePreferences((draft) => {
                draft.appearance.primaryColor = "custom";
                draft.appearance.customPrimaryColor = value;
              })
            }
          >
            <ColorPickerTrigger asChild>
              <button
                type="button"
                className={cn(
                  colorButtonClassName,
                  preferences.appearance.primaryColor === "custom" && "border-primary bg-primary/10"
                )}
              >
                <span className="relative">
                  <ColorPickerSwatch className="size-5 rounded-md" />
                  {preferences.appearance.primaryColor === "custom" && (
                    <Check className="absolute inset-0 m-auto size-3.5 text-white drop-shadow" />
                  )}
                </span>
                <Palette className="ml-2 size-4 text-muted-foreground" />
                <span className="sr-only">自定义</span>
              </button>
            </ColorPickerTrigger>
            <ColorPickerContent align="end" className="z-[130]">
              <ColorPickerArea />
              <ColorPickerHueSlider />
              <ColorPickerInput withoutAlpha />
            </ColorPickerContent>
          </ColorPicker>
          <div className="text-center text-xs text-muted-foreground">自定义</div>
        </div>
      </div>
    </section>
  );
}
