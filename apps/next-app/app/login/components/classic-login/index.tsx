import { cn } from "@rap/utils";
import type React from "react";
import loginImage from "@/app/assets/login-image.svg";
import { LoginForm } from "../login-form";

export function ClassicLogin({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>
			<div className="flex-center p-4">
				<div className="w-full max-w-sm space-y-6">
					<h1 className=" flex-col-center text-2xl font-bold">Welcome to login</h1>
					<LoginForm />
				</div>
			</div>
			<div className="bg-muted relative hidden lg:flex-center">
				<img src={loginImage.src} alt="login" />
			</div>
		</div>
	);
}
