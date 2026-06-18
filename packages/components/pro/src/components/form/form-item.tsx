"use client";

import { isValidElement, type ReactNode } from "react";
import {
  FormControl,
  FormDescription,
  FormField as UIFormField,
  FormLabel,
  FormMessage,
} from "@rap/components-ui/form";
import { cn } from "@rap/utils";

import { useFormContext } from "./form-context";
import type { AnyFormApi, FormItemProps, FormItemRenderContext, NamePath } from "./types";
import {
  getEventValue,
  getValueByNamePath,
  injectControlProps,
  setValueByNamePath,
  toFieldName,
} from "./utils";

function DependencyRenderer<TFormData>({
  children,
  dependencies,
  form,
}: {
  children: ReactNode | (() => ReactNode);
  dependencies?: string[];
  form: AnyFormApi<TFormData>;
}) {
  if (!dependencies?.length) {
    return <>{typeof children === "function" ? children() : children}</>;
  }

  return (
    <form.Subscribe
      selector={(state) =>
        JSON.stringify(dependencies.map((name) => (state.values as Record<string, unknown>)[name]))
      }
    >
      {() => <>{typeof children === "function" ? children() : children}</>}
    </form.Subscribe>
  );
}

export function FormItem<TFormData = unknown>({
  blurTrigger = "onBlur",
  children,
  dependencies,
  description,
  getValueFromEvent,
  getValueProps,
  hidden,
  label,
  name,
  noStyle,
  normalize,
  required,
  trigger = "onChange",
  validateMode = "touched",
  valuePropName = "value",
  ...props
}: FormItemProps<TFormData>) {
  const { disabled, form, labelAlign, labelWrap, layout, onValuesChange, requiredMark } =
    useFormContext<TFormData>();

  if (!name) {
    const renderContent = () => {
      const values = form.state.values;
      const context = {
        bind: {},
        field: undefined,
        form,
        getFieldValue: (fieldName: NamePath<TFormData>) => getValueByNamePath(values, fieldName),
        getFieldsValue: () => values,
        isInvalid: false,
      } as unknown as FormItemRenderContext<TFormData>;

      return typeof children === "function" ? children(context) : children;
    };

    if (!dependencies?.length) {
      return renderContent();
    }

    return (
      <DependencyRenderer dependencies={dependencies?.map(toFieldName)} form={form}>
        {renderContent}
      </DependencyRenderer>
    );
  }

  const content = (
    <UIFormField
      {...props}
      name={toFieldName(name) as never}
      showMessage={false}
      validateMode={validateMode}
      fieldProps={{
        className: cn(
          hidden && "hidden",
          noStyle && "contents",
          !noStyle && layout === "vertical" && "grid gap-2",
          !noStyle && layout === "horizontal" && "contents",
          !noStyle &&
            layout === "inline" &&
            "inline-grid w-auto items-center gap-x-2 gap-y-1 sm:grid-cols-[max-content_minmax(0,1fr)]"
        ),
      }}
      render={({ field, isInvalid }) => {
        if (hidden) {
          return null;
        }

        const handleChange = (...args: unknown[]) => {
          const previousValues = form.state.values;
          const prevValue = getValueByNamePath(previousValues, name);
          const eventValue = getEventValue(args, valuePropName, getValueFromEvent);
          const nextValue = normalize
            ? normalize(eventValue, prevValue, previousValues)
            : eventValue;

          field.handleChange(nextValue);

          const allValues = setValueByNamePath(previousValues, name, nextValue);
          const changedValues = setValueByNamePath({} as Partial<TFormData>, name, nextValue);

          onValuesChange?.(changedValues, allValues);
        };
        const valueProps = getValueProps
          ? getValueProps(field.state.value)
          : { [valuePropName]: field.state.value };
        const bind = {
          name: field.name,
          disabled,
          "aria-invalid": isInvalid,
          ...valueProps,
          [trigger]: handleChange,
          [blurTrigger]: field.handleBlur,
        };
        const context: FormItemRenderContext<TFormData> = {
          bind,
          field,
          form,
          getFieldValue: (fieldName) => getValueByNamePath(form.state.values, fieldName),
          getFieldsValue: () => form.state.values,
          isInvalid,
        };
        const childProps = isValidElement(children)
          ? (children.props as Record<string, unknown>)
          : {};
        const originalChange = childProps[trigger];
        const originalBlur = childProps[blurTrigger];
        const controlProps = {
          ...bind,
          ...(typeof label === "string" && childProps.placeholder === undefined
            ? { placeholder: label }
            : {}),
          [trigger]: (...args: unknown[]) => {
            handleChange(...args);

            if (typeof originalChange === "function") {
              originalChange(...args);
            }
          },
          [blurTrigger]: (...args: unknown[]) => {
            field.handleBlur();

            if (typeof originalBlur === "function") {
              originalBlur(...args);
            }
          },
        };
        const control =
          typeof children === "function"
            ? children(context)
            : isValidElement(children)
              ? injectControlProps(children, controlProps)
              : children;

        if (noStyle) {
          return control;
        }

        return (
          <>
            {label ? (
              <FormLabel
                className={cn(
                  "min-w-0 items-start gap-1 text-sm font-medium",
                  layout === "horizontal" && "self-start pt-2.5",
                  layout === "inline" && "self-start pt-2.5",
                  layout !== "vertical" && labelAlign === "right" && "justify-end text-right",
                  (layout === "vertical" || labelAlign === "left") && "justify-start text-left",
                  layout === "horizontal" && labelWrap && "max-w-32 whitespace-normal",
                  !labelWrap && "whitespace-nowrap"
                )}
              >
                {required && requiredMark ? (
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                ) : (
                  <span className="w-1.5 shrink-0" aria-hidden />
                )}
                <span className={cn("min-w-0", labelWrap && "whitespace-normal")}>{label}</span>
              </FormLabel>
            ) : null}
            <div className={cn("grid min-w-0 gap-1.5", layout === "horizontal" && "self-start")}>
              <FormControl>{control}</FormControl>
              {description ? <FormDescription>{description}</FormDescription> : null}
              <FormMessage />
            </div>
          </>
        );
      }}
    />
  );

  if (hidden || !dependencies?.length) {
    return content;
  }

  return (
    <DependencyRenderer dependencies={dependencies?.map(toFieldName)} form={form}>
      {content}
    </DependencyRenderer>
  );
}
