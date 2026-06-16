"use client";

import { createContext, use, useId, type ComponentProps, type ReactNode } from "react";
import { Slot } from "radix-ui";
import { type AnyFieldApi, type DeepKeys, type ReactFormExtendedApi } from "@tanstack/react-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "./field";

type AnyFormApi<TFormData = unknown> = ReactFormExtendedApi<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

type FormContextValue<TFormData = unknown> = {
  form: AnyFormApi<TFormData>;
};

const FormContext = createContext<FormContextValue<any> | null>(null);

function useFormContext<TFormData = unknown>() {
  const formContext = use(FormContext);

  if (!formContext) {
    throw new Error("useFormContext must be used within a Form component");
  }

  return formContext as FormContextValue<TFormData>;
}

type FormFieldContextValue = {
  field: AnyFieldApi;
  isInvalid: boolean;
  id: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormField() {
  const fieldContext = use(FormFieldContext);

  if (!fieldContext) {
    throw new Error("useFormField must be used within a FormField component");
  }

  return fieldContext;
}

type ErrorDisplayMode = "touched" | "dirty" | "submitted" | "always";

function getIsInvalid<TFormData>(
  field: AnyFieldApi,
  form: AnyFormApi<TFormData>,
  mode: ErrorDisplayMode
) {
  const { meta } = field.state;
  const submissionAttempts = form.state.submissionAttempts ?? 0;

  if (meta.isValid) {
    return false;
  }

  if (mode === "always") {
    return true;
  }

  if (mode === "dirty") {
    return meta.isDirty;
  }

  if (mode === "submitted") {
    return submissionAttempts > 0;
  }

  return meta.isTouched || submissionAttempts > 0;
}

export type FormProps<TFormData = unknown> = {
  children: ReactNode;
  form: AnyFormApi<TFormData>;
} & ComponentProps<"form">;

export function Form<TFormData = unknown>({ children, form, ...props }: FormProps<TFormData>) {
  return (
    <FormContext value={{ form }}>
      <form {...props}>{children}</form>
    </FormContext>
  );
}

type FormFieldRenderProps = FormFieldContextValue;

type FormFieldProps<
  TFormData = unknown,
  TName extends DeepKeys<TFormData> = DeepKeys<TFormData>,
> = {
  name: TName;
  children?: ReactNode;
  description?: ReactNode;
  fieldProps?: ComponentProps<typeof Field>;
  label?: ReactNode;
  messageProps?: FormMessageProps;
  render?: (props: FormFieldRenderProps) => ReactNode;
  showMessage?: boolean;
  validateMode?: ErrorDisplayMode;
} & Omit<ComponentProps<AnyFormApi<TFormData>["Field"]>, "children" | "name">;

export function FormField<
  TFormData = unknown,
  TName extends DeepKeys<TFormData> = DeepKeys<TFormData>,
>({
  children,
  description,
  fieldProps,
  label,
  messageProps,
  name,
  render,
  showMessage = true,
  validateMode = "touched",
  ...props
}: FormFieldProps<TFormData, TName>) {
  const id = useId();
  const { form } = useFormContext<TFormData>();

  return (
    <form.Field {...props} name={name}>
      {(field) => {
        const isInvalid = getIsInvalid(field, form, validateMode);
        const fieldContext: FormFieldContextValue = {
          field,
          isInvalid,
          id,
          formItemId: `${id}-form-item`,
          formDescriptionId: `${id}-form-description`,
          formMessageId: `${id}-form-message`,
        };

        return (
          <Field {...fieldProps} data-invalid={isInvalid}>
            <FormFieldContext value={fieldContext}>
              {label ? <FormLabel>{label}</FormLabel> : null}
              {description ? <FormDescription>{description}</FormDescription> : null}
              {render ? render(fieldContext) : children}
              {showMessage ? <FormMessage {...messageProps} /> : null}
            </FormFieldContext>
          </Field>
        );
      }}
    </form.Field>
  );
}

export function createFormComponents<TFormData>() {
  function TypedForm(props: FormProps<TFormData>) {
    return <Form<TFormData> {...props} />;
  }

  function TypedFormField<TName extends DeepKeys<TFormData>>(
    props: FormFieldProps<TFormData, TName>
  ) {
    return <FormField<TFormData, TName> {...props} />;
  }

  return {
    Form: TypedForm,
    Field: TypedFormField,
    Label: FormLabel,
    Control: FormControl,
    Description: FormDescription,
    Message: FormMessage,
    useFormContext: () => useFormContext<TFormData>(),
    useFormField,
  };
}

type FormLabelProps = ComponentProps<typeof FieldLabel>;

export function FormLabel(props: FormLabelProps) {
  const { formItemId } = useFormField();

  return <FieldLabel htmlFor={formItemId} {...props} />;
}

type FormControlProps = ComponentProps<typeof Slot.Root>;

export function FormControl(props: FormControlProps) {
  const { field, formDescriptionId, formItemId, formMessageId, isInvalid } = useFormField();
  const controlProps = {
    id: formItemId,
    name: field.name,
    "aria-describedby": isInvalid ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
    "aria-invalid": isInvalid,
  } as ComponentProps<typeof Slot.Root>;

  return <Slot.Root {...controlProps} {...props} />;
}

type FormDescriptionProps = ComponentProps<typeof FieldDescription>;

export function FormDescription(props: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();

  return <FieldDescription id={formDescriptionId} {...props} />;
}

type FormMessageProps = ComponentProps<typeof FieldError>;

export function FormMessage(props: FormMessageProps) {
  const { field, formMessageId, isInvalid } = useFormField();

  if (!isInvalid) {
    return null;
  }

  return <FieldError id={formMessageId} errors={field.state.meta.errors} {...props} />;
}

export { useFormContext, useFormField };
