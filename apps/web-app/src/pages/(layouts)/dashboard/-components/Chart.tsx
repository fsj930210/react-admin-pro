import type { FC, CSSProperties } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
	GridComponent,
	TooltipComponent,
	TitleComponent,
	DatasetComponent,
	LegendComponent,
	RadarComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useTheme } from "@rap/components-ui/theme-provider";
import type { EChartsOption } from "echarts";

echarts.use([
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	RadarComponent,
	BarChart,
	LineChart,
	PieChart,
	CanvasRenderer,
	DatasetComponent
]);

interface EChartsOpts {
	readonly devicePixelRatio?: number;
	readonly renderer?: 'canvas' | 'svg';
	readonly width?: number | null | undefined | 'auto';
	readonly height?: number | null | undefined | 'auto';
	readonly locale?: string;
}

interface ChartProps {
	option: EChartsOption;
	style?: CSSProperties;
	className?: string;
	notMerge?: boolean;
	lazyUpdate?: boolean;
	opts?: EChartsOpts;
	// biome-ignore lint:suspicious/noExplicitAny
	onEvents?: Record<string, (...args: any[]) => void>;
}

export const Chart: FC<ChartProps> = ({
	option,
	style,
	className,
	notMerge = false,
	lazyUpdate = false,
	opts,
	onEvents,
}) => {
	const { theme } = useTheme();

	return (
		<ReactECharts
			option={option}
			style={style}
			className={className}
			theme={theme}
			notMerge={notMerge}
			lazyUpdate={lazyUpdate}
			opts={opts}
			onEvents={onEvents}
		/>
	);
};
