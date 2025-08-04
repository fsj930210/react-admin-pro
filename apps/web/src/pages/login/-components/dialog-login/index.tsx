import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@rap/components-base/dialog";
import { useState } from "react";
import { LoginForm } from "../login-form";

export function DialogLogin() {
	const [open, setOpen] = useState(true);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Welcome to login</DialogTitle>
				</DialogHeader>
				<LoginForm />
			</DialogContent>
		</Dialog>
	);
}
