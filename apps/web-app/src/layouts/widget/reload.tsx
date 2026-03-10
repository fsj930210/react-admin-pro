import { Button } from "@rap/components-base/button";
import { RefreshCw } from "lucide-react";

export function ReloadFeature(props: React.ComponentProps<"button">) {
	const handleReload = () => {
		window.location.reload();
	};

	return (
		<Button variant="ghost" size="icon" onClick={handleReload} title="重新加载当前页面" {...props}>
			<RefreshCw className="h-4 w-4" />
		</Button>
	);
}
