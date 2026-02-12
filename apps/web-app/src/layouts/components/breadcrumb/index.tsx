import { CapsuleBreadcrumb } from "./components/capsule-breadcrumb";
import { ClassicBreadcrumb } from "./components/classic-breadcrumb";
import { ParallelogramBreadcrumb } from "./components/parallelogram-breadcrumb";
import { RibbonBreadcrumb } from "./components/ribbon-breadcrumb";
import type { BreadcrumbMode, BreadcrumbType } from "./types";
import { useBreadcrumb } from "./use-breadcrumb";

interface BreadcrumbProps {
	type?: BreadcrumbType;
	mode?: BreadcrumbMode;
}

const BreadcrumbItemStrategies = {
	parallelogram: ParallelogramBreadcrumb,
	capsule: CapsuleBreadcrumb,
	classic: ClassicBreadcrumb,
	ribbon: RibbonBreadcrumb,
};

export function Breadcrumb({ type = "ribbon", mode = "menu" }: BreadcrumbProps) {
	const { breadcrumbList, handleBreadcrumbItemClick } = useBreadcrumb();
	const BreadcrumbComponent = BreadcrumbItemStrategies[type];
	return (
		<BreadcrumbComponent
			data={breadcrumbList}
			mode={mode}
			onBreadcrumbItemClick={handleBreadcrumbItemClick}
		/>
	);
}
