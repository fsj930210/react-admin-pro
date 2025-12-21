import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/features/panel-controls/")({
	component: PanelControlsFeaturePage,
});

function PanelControlsFeaturePage() {
	return <div>Panel Controls</div>;
}
