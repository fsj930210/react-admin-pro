import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";
import { Switch } from "@rap/components-ui/switch";
import type { TabType } from "@/layouts/components/tabs/types";
import { headerFeatureOptions, tabTypeOptions } from "./options";
import { controlClassName, Field, Section, selectContentClassName } from "./shared";
import type { PreferencesPanelProps } from "./types";

export function TabsPanel({ preferences, updatePreferences }: PreferencesPanelProps) {
  return (
    <div className="space-y-6">
      <Section title="标签页">
        <Field label="启用标签页">
          <Switch
            checked={preferences.tabs.enabled}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.tabs.enabled = checked;
              })
            }
          />
        </Field>
        <Field label="标签样式">
          <Select
            value={preferences.tabs.type}
            onValueChange={(value) =>
              updatePreferences((draft) => {
                draft.tabs.type = value as TabType;
              })
            }
          >
            <SelectTrigger className={controlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              {tabTypeOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="拖拽排序">
          <Switch
            checked={preferences.tabs.sortable}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.tabs.sortable = checked;
              })
            }
          />
        </Field>
        <Field label="刷新按钮">
          <Switch
            checked={preferences.tabs.showRefresh}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.tabs.showRefresh = checked;
              })
            }
          />
        </Field>
        <Field label="最大化按钮">
          <Switch
            checked={preferences.tabs.showMaximize}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.tabs.showMaximize = checked;
              })
            }
          />
        </Field>
        <Field label="右键菜单">
          <Switch
            checked={preferences.tabs.showContextMenu}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.tabs.showContextMenu = checked;
              })
            }
          />
        </Field>
      </Section>

      <Section title="顶栏工具">
        {headerFeatureOptions.map((item) => (
          <Field key={item.value} label={item.label}>
            <Switch
              checked={preferences.layout.header.rightFeatures.includes(item.value)}
              onCheckedChange={(checked) =>
                updatePreferences((draft) => {
                  const features = draft.layout.header.rightFeatures;
                  const exists = features.includes(item.value);
                  if (checked && !exists) features.push(item.value);
                  if (!checked && exists) {
                    draft.layout.header.rightFeatures = features.filter(
                      (feature) => feature !== item.value
                    );
                  }
                })
              }
            />
          </Field>
        ))}
      </Section>
    </div>
  );
}
