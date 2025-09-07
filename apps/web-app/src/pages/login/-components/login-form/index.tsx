import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@rap/components-base/button";
import { Checkbox } from "@rap/components-base/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@rap/components-base/form";
import { Input } from "@rap/components-base/input";
import { cn } from "@rap/utils";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { QuickLogForm } from "../quick-login";

type LoginFormProps = React.ComponentPropsWithoutRef<"form"> & {
	className?: string;
	quickLoginStyle?: "inline" | "block";
};
const FormSchema = z.object({
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
	remember: z.boolean().optional(),
});

export function LoginForm({ className, quickLoginStyle = "inline" }: LoginFormProps) {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			username: "",
			password: "",
			remember: false,
		},
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		toast("You submitted the following values", {
			description: (
				<pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="username" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={() => (
						<FormItem>
							<FormControl>
								<Input placeholder="password" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex-items-center">
					<FormField
						control={form.control}
						name="remember"
						render={({ field }) => (
							<FormItem className="!flex-items-center space-x-1">
								<FormControl>
									<Checkbox
										checked={!!field.value}
										onCheckedChange={(checked) => {
											return field.onChange(checked);
										}}
									/>
								</FormControl>
								<FormLabel>Remember me</FormLabel>
							</FormItem>
						)}
					/>
					<a href="#id" className="ml-auto text-sm underline-offset-4 hover:underline">
						Forgot your password?
					</a>
				</div>
				<Button type="submit" className="w-full">
					Submit
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
			</form>
		</Form>
	);
}
