import { Switch } from "@rap/components-ui/switch";
import { Field, Section, textInputClassName } from "./shared";
import type { PreferencesPanelProps } from "./types";

export function CommonPanel({ preferences, updatePreferences }: PreferencesPanelProps) {
  return (
    <div className="space-y-6">
      <Section title="应用">
        <Field label="应用名称">
          <input
            aria-label="搴旂敤鍚嶇О"
            type="text"
            value={preferences.app.name}
            className={textInputClassName}
            onChange={(event) =>
              updatePreferences((draft) => {
                draft.app.name = event.target.value;
              })
            }
          />
        </Field>
        <Field label="应用简称">
          <input
            aria-label="搴旂敤绠€绉?"
            type="text"
            value={preferences.app.shortName}
            className={textInputClassName}
            onChange={(event) =>
              updatePreferences((draft) => {
                draft.app.shortName = event.target.value;
              })
            }
          />
        </Field>
        <Field label="动态标题">
          <Switch
            aria-label="鍔ㄦ€佹爣棰?"
            checked={preferences.app.dynamicTitle}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.app.dynamicTitle = checked;
              })
            }
          />
        </Field>
        <Field label="标题模板">
          <input
            aria-label="鏍囬妯℃澘"
            type="text"
            value={preferences.app.titleTemplate}
            className={textInputClassName}
            onChange={(event) =>
              updatePreferences((draft) => {
                draft.app.titleTemplate = event.target.value;
              })
            }
          />
        </Field>
      </Section>

      <Section title="国际化">
        <Field label="默认语言">
          <input
            aria-label="榛樿璇█"
            type="text"
            value={preferences.i18n.defaultLanguage}
            className={textInputClassName}
            onChange={(event) =>
              updatePreferences((draft) => {
                draft.i18n.defaultLanguage = event.target.value;
              })
            }
          />
        </Field>
        <Field label="默认时区">
          <input
            aria-label="榛樿鏃跺尯"
            type="text"
            value={preferences.i18n.timezone}
            className={textInputClassName}
            onChange={(event) =>
              updatePreferences((draft) => {
                draft.i18n.timezone = event.target.value;
              })
            }
          />
        </Field>
        <Field label="语言切换入口">
          <Switch
            aria-label="璇█鍒囨崲鍏ュ彛"
            checked={preferences.i18n.showSwitcher}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.i18n.showSwitcher = checked;
              })
            }
          />
        </Field>
      </Section>

      <Section title="动画加载">
        <Field label="页面进度条">
          <Switch
            aria-label="椤甸潰杩涘害鏉?"
            checked={preferences.animation.progress}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.animation.progress = checked;
              })
            }
          />
        </Field>
        <Field label="页面 Loading">
          <Switch
            aria-label="椤甸潰 Loading"
            checked={preferences.animation.pageLoading}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.animation.pageLoading = checked;
              })
            }
          />
        </Field>
        <Field label="页面切换动画">
          <Switch
            aria-label="椤甸潰鍒囨崲鍔ㄧ敾"
            checked={preferences.animation.pageTransition}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.animation.pageTransition = checked;
              })
            }
          />
        </Field>
        <Field label="减少动画">
          <Switch
            aria-label="鍑忓皯鍔ㄧ敾"
            checked={preferences.animation.reducedMotion}
            onCheckedChange={(checked) =>
              updatePreferences((draft) => {
                draft.animation.reducedMotion = checked;
              })
            }
          />
        </Field>
      </Section>
    </div>
  );
}
