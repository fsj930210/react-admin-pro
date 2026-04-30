import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@rap/components-ui/button";
import { Checkbox } from "@rap/components-ui/checkbox";
import { Input } from "@rap/components-ui/input";
import {
	FieldGroup,
	FieldLabel,
} from "@rap/components-ui/field";
import { Form, FormField } from "@rap/components-ui/form";
import { cn } from "@rap/utils";
import { useAuth } from "../../-hooks/useAuth";
import { QuickLogForm } from "../quick-login";

type LoginFormProps = React.ComponentPropsWithoutRef<"form"> & {
	className?: string;
	quickLoginStyle?: "inline" | "block";
};
const formSchema = z.object({
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
	remember: z.boolean(),
});

export function LoginForm({ className, quickLoginStyle = "inline" }: LoginFormProps) {
	const { loginMutation } = useAuth();
	const form = useForm({
		defaultValues: {
			username: "",
			password: "",
			remember: false,
		},
		validators: {
			onChange: formSchema,
			onSubmit: formSchema,
		},
		onSubmit: ({ value }) => {
			console.log(value)
			loginMutation.mutate(value);
		}
	});


	return (
		<Form
			form={form}
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit()
			}}
			className={cn("space-y-4", className)}
		>
			<FieldGroup>
				<FormField
					name="username"
					render={({ field, isInvalid }) => (
						<>
							<FieldLabel htmlFor="username">
								Username
							</FieldLabel>
							<Input
								placeholder="username"
								id="username"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
						</>
					)}
				/>
				<FormField
					name="password"
					render={({ field, isInvalid }) => (
						<>
							<FieldLabel htmlFor="password">
								Password
							</FieldLabel>
							<Input
								type="password"
								placeholder="password"
								id="password"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={isInvalid}
							/>
						</>
					)}
				/>
			</FieldGroup>

			<div className="flex items-center">
				<FormField
					name="remember"
					fieldProps={{
						className: "w-auto",
					}}
					render={({ field }) => (
						<div className="flex items-center! space-x-1">
							<Checkbox
								id="remember"
								name={field.name}
								checked={field.state.value}
								onCheckedChange={(checked) =>
									field.handleChange(checked === true)
								}
							/>
							<FieldLabel>Remember me</FieldLabel>
						</div>
					)}
				/>
				<a href="#id" className="ml-auto text-sm underline-offset-4 hover:underline">
					Forgot your password?
				</a>
			</div>
			<Button type="submit" className="w-full" disabled={loginMutation.isPending}>
				{loginMutation.isPending ? "Logging in..." : "Submit"}
			</Button>
			<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
				<span className="relative z-10 bg-background px-2 text-muted-foreground">Or</span>
			</div>
			<QuickLogForm block={quickLoginStyle === "block"} />
			<section className="text-center text-sm">
				Don&apos;t have an account?{" "}
				<a href="#1" className="underline underline-offset-4">
					Sign up
				</a>
			</section>
			<section className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
				By clicking continue, you agree to our <a href="#1">Terms of Service</a> and{" "}
				<a href="#1">Privacy Policy</a>.
			</section>
		</Form>
	);
}
