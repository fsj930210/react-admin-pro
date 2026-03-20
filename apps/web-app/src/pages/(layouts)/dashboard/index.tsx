import { Button } from "@rap/components-base/button";

import { createFileRoute } from "@tanstack/react-router";
import { useAppConfigSelector } from "@/store/app-config";

export const Route = createFileRoute("/(layouts)/dashboard/")({
	component: DashboardPage,
});

export function DashboardPage() {
	const { count, setCount } = useAppConfigSelector([
		"count",
		"setCount",
	]);

	return (
		<div className="size-full flex flex-col">
			<div>
				<Button onClick={() => setCount(count + 1)}>{count} +</Button>
				<Button
					onClick={() =>
						setCount((state) => {
							return state.count - 1;
						})
					}
				>
					{count} -
				</Button>
			</div>
		</div>
	);
}
