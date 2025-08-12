import { cn } from "@rap/utils";
import type React from "react";
import LoginImage from "@/assets/images/login-image.svg?react";
import { LoginForm } from "../login-form";

export function ClassicLogin({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div className={cn("grid min-h-svh lg:grid-cols-2 p-4", className)} {...props}>
			<div className="flex-center">
				<div className="w-full max-w-sm space-y-6">
					<h1 className=" flex-col-center text-2xl font-bold">Welcome to login</h1>
					<LoginForm />
				</div>
			</div>
			<div className="bg-muted relative hidden lg:flex-center">
				<LoginImage />
			</div>
		</div>
	);
}
