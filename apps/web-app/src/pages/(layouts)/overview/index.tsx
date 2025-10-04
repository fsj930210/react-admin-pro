import { Button } from "@rap/components-base/button";
import { createFileRoute } from "@tanstack/react-router";
import { useAppConfigSelector } from "@/store/app-config";

export const Route = createFileRoute("/(layouts)/overview/")({
	component: OverviewPage,
});

export function OverviewPage() {
	const { appearanceConfig, setAppearanceConfig } = useAppConfigSelector([
		"appearanceConfig",
		"setAppearanceConfig",
	]);
	return (
		<div className="size-full">
			appTheme: {appearanceConfig?.appTheme}
			<div>
				<Button
					onClick={() =>
						setAppearanceConfig({
							...appearanceConfig,
							appTheme: appearanceConfig.appTheme === "light" ? "dark" : "light",
						})
					}
				>
					{appearanceConfig?.appTheme === "light" ? "切换到暗黑" : "切换到亮色"}
				</Button>
			</div>
		</div>
	);
}
