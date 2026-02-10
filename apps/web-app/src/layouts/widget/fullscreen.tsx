import { Button } from "@rap/components-base/button";
import { Maximize, Minimize } from "lucide-react";
import { useState } from "react";

interface FullscreenFeatureProps {
	className?: string;
}

export function FullscreenFeature({ className }: FullscreenFeatureProps) {
	const [isFullscreen, setIsFullscreen] = useState(false);

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().then(() => {
				setIsFullscreen(true);
			});
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen().then(() => {
					setIsFullscreen(false);
				});
			}
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleFullscreen}
			className={className}
			title={isFullscreen ? "退出全屏" : "进入全屏"}
		>
			{isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
		</Button>
	);
}
