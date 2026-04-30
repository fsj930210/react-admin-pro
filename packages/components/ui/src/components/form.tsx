"use client"

import { use, createContext, type ComponentProps, } from "react"
import {
	type AnyFieldApi,
	type ReactFormExtendedApi,
} from '@tanstack/react-form'
import {
	Field,
	FieldError,
} from './field'

type FormContextValue<TFormData = unknown> = {
	form: ReactFormExtendedApi<TFormData, any, any, any, any, any, any, any, any, any, any, any>;
}
const FormContext = createContext<FormContextValue<any> | null>(null)
const useFormContext = () => {
	const formContext = use(FormContext);
	if (!formContext) {
		throw new Error("useFormContext must be used within a Form component");
	}
	return formContext
}
export type FormProps<TFormData = unknown> = {
	children: React.ReactNode;
	form: ReactFormExtendedApi<TFormData, any, any, any, any, any, any, any, any, any, any, any>;
} & ComponentProps<'form'>;
export function Form<TFormData = unknown>({ children, form, ...rest }: FormProps<TFormData>) {
	return (
		<FormContext value={{ form } as FormContextValue<any>}>
			<form {...rest}>{children}</form>
		</FormContext>
	)
}

type FormFieldContextValue = {
	field: AnyFieldApi;
	isInvalid: boolean;
}
const FormFieldContext = createContext<FormFieldContextValue | null>(null)
const useFormField = () => {
	const formItemContext = use(FormFieldContext);
	if (!formItemContext) {
		throw new Error("useFormField must be used within a FormField component");
	}
	return formItemContext
}

type FormFieldProps = {
	name: string;
	render: ({ field, isInvalid }: FormFieldContextValue) => React.ReactNode;
	fieldProps?: ComponentProps<typeof Field>;
	fieldErrorProps?: FormFieldErrorProps;
} & Omit<ComponentProps<ReactFormExtendedApi<any, any, any, any, any, any, any, any, any, any, any, any>['Field']>, 'children'>;
export function FormField({ render, name, fieldProps, fieldErrorProps, ...rest }: FormFieldProps) {
	const { form } = useFormContext();
	return (
		<form.Field
			{...rest}
			name={name}
			children={(field) => {
				const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
				return (
					<Field data-invalid={isInvalid} {...fieldProps}>
						<FormFieldContext value={{ field, isInvalid }}>
							{render({ field, isInvalid })}
							<FormFieldError {...fieldErrorProps} />
						</FormFieldContext>
					</Field>
				)
			}}
		/>
	)
}
type FormFieldErrorProps = ComponentProps<typeof FieldError> & { showError?: boolean };
export function FormFieldError({ showError = true, ...props }: FormFieldErrorProps) {
	const { field, isInvalid } = useFormField();

	return (
		showError && isInvalid ? <FieldError errors={field.state.meta.errors} {...props} /> : null
	)
}