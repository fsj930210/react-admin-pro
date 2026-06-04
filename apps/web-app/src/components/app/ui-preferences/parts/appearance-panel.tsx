import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";
import { Switch } from "@rap/components-ui/switch";
import type { AppTheme, DensityMode, FontScale, RadiusMode } from "@/config/ui-preferences";
import { densityOptions, fontScaleOptions, radiusOptions, themeOptions } from "./options";
import { controlClassName, Field, Section, selectContentClassName } from "./shared";
import type { PreferencesPanelProps } from "./types";

export function AppearancePanel({ preferences, updatePreferences }: PreferencesPanelProps) {
  return (
    <div className="space-y-6">
      <Section title="主题">
        <Field label="默认主题">
          <Select
            value={preferences.appearance.theme}
            onValueChange={(value) =>
              updatePreferences((draft) => {
                draft.appearance.theme = value as AppTheme;
              })
            }
          >
            <SelectTrigger className={controlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {themeOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="跟随系统">
          <Switch
            checked={preferences.appearance.followSystem}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.appearance.followSystem = checked;
              })
            }
          />
        </Field>
        <Field label="灰色模式">
          <Switch
            checked={preferences.appearance.grayscale}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.appearance.grayscale = checked;
              })
            }
          />
        </Field>
      </Section>

      <Section title="视觉">
        <Field label="全局圆角">
          <Select
            value={preferences.appearance.radius}
            onValueChange={(value) =>
              updatePreferences((draft) => {
                draft.appearance.radius = value as RadiusMode;
              })
            }
          >
            <SelectTrigger className={controlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {radiusOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="字体大小">
          <Select
            value={preferences.appearance.fontScale}
            onValueChange={(value) =>
              updatePreferences((draft) => {
                draft.appearance.fontScale = value as FontScale;
              })
            }
          >
            <SelectTrigger className={controlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {fontScaleOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="界面密度">
          <Select
            value={preferences.appearance.density}
            onValueChange={(value) =>
              updatePreferences((draft) => {
                draft.appearance.density = value as DensityMode;
              })
            }
          >
            <SelectTrigger className={controlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {densityOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </Section>
    </div>
  );
}
