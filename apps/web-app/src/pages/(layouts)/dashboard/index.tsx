// import { Loading } from "@rap/components-ui/loading";

import { Button } from "@rap/components-base/button";
import { createFileRoute } from "@tanstack/react-router";
import { useAppConfigSelector } from "@/store/app-config";
export const Route = createFileRoute("/(layouts)/dashboard/")({
	component: DashboardPage,
});

export function DashboardPage() {
	const { layoutConfig, setLayoutConfig, count, setCount } =
		useAppConfigSelector([
			"layoutConfig",
			"setLayoutConfig",
			"count",
			"setCount",
		]);

	return (
		<div className="size-full">
			showTabs: {layoutConfig?.showTabs + ""}
			<div>
				<Button
					onClick={() =>
						setLayoutConfig((_, layoutConfig) => {
							layoutConfig.showTabs = !layoutConfig.showTabs;
						})
					}
				>
					{layoutConfig?.showTabs ? "隐藏" : "显示"}
				</Button>
				<Button
					onClick={() =>
						setLayoutConfig({
							...layoutConfig,
							showTabs: !layoutConfig.showTabs,
						})
					}
				>
					{layoutConfig?.showTabs ? "隐藏" : "显示"}
				</Button>
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
