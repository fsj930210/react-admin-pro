"use client";

import { useForm as useTanStackForm } from "@tanstack/react-form";
import { Form as UIForm } from "@rap/components-ui/form";
import { cn } from "@rap/utils";

import { FormContext } from "./form-context";
import type { AnyFormApi, AnyFormOptions, FormProps } from "./types";
import { getErrorFields } from "./utils";

export function Form<TFormData = Record<string, unknown>>({
  children,
  className,
  disabled,
  form: formProp,
  initialValues,
  labelAlign = "right",
  labelWrap = true,
  layout = "vertical",
  onFinish,
  onFinishFailed,
  onValuesChange,
  requiredMark = true,
  scrollToFirstError,
  validators,
  ...props
}: FormProps<TFormData>) {
  const innerForm = useTanStackForm({
    defaultValues: initialValues,
    validators,
    onSubmit: async ({ value }) => {
      await onFinish?.(value);
    },
  });
  const form = (formProp ?? innerForm) as AnyFormApi<TFormData>;

  return (
    <FormContext
      value={{
        disabled,
        form,
        labelAlign,
        labelWrap,
        layout,
        onValuesChange,
        requiredMark,
      }}
    >
      <UIForm
        {...props}
        form={form}
        noValidate
        data-layout={layout}
        className={cn(
          "w-full",
          layout === "vertical" && "grid gap-4",
          layout === "horizontal" &&
            "grid grid-cols-[max-content_minmax(0,1fr)] items-start gap-x-4 gap-y-4",
          layout === "inline" && "flex flex-wrap items-center gap-3",
          className
        )}
        onSubmit={async (event) => {
          event.preventDefault();
          event.stopPropagation();

          const formElement = event.currentTarget;

          await form.handleSubmit();

          if (!form.state.isValid) {
            if (scrollToFirstError) {
              const shouldFocus =
                typeof scrollToFirstError === "object" ? scrollToFirstError.focus : true;

              requestAnimationFrame(() => {
                const firstInvalid =
                  formElement.querySelector<HTMLElement>('[aria-invalid="true"]');

                firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });

                if (shouldFocus) {
                  firstInvalid?.focus?.();
                }
              });
            }

            onFinishFailed?.({
              values: form.state.values,
              errorFields: getErrorFields(form),
            });
          }
        }}
      >
        {children}
      </UIForm>
    </FormContext>
  );
}

export function useForm<TFormData = Record<string, unknown>>(options?: AnyFormOptions<TFormData>) {
  return useTanStackForm(options) as unknown as AnyFormApi<TFormData>;
}
