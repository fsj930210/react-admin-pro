import { Button } from "@rap/components-base/button";
import { cn } from "@rap/utils";
import { Github } from "@/app/components/svg-icons/github";
import { Google } from "@/app/components/svg-icons/google";

type QuickLogFormProps = {
	block?: boolean;
};
export function QuickLogForm({ block }: QuickLogFormProps) {
	return (
		<div className="flex flex-col gap-6">
			<div className={cn("grid gap-6", block ? "" : "grid-cols-2")}>
				<Button variant="outline" className="w-full">
					<Github />
					Login with Github
				</Button>
				<Button variant="outline" className="w-full">
					<Google />
					Login with Google
				</Button>
			</div>
		</div>
	);
}
