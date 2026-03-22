import { Input } from "@rap/components-base/input";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/overview/")({
	component: OverviewPage,
});

export function OverviewPage() {
	return (
		<div className="size-full">
			<Input placeholder="请输入搜索内容" />
		</div>
	);
}
