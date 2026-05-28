import { Button } from "@rap/components-ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rap/components-ui/tabs";
import { cn } from "@rap/utils";
import { Check, Copy, RotateCcw, Settings2, X } from "lucide-react";
import { useState } from "react";
import { uiPreferencesStore, useUIPreferences } from "@/store/ui-preferences";
import { AppearancePanel } from "./parts/appearance-panel";
import { CommonPanel } from "./parts/common-panel";
import { LayoutPanel } from "./parts/layout-panel";
import { TabsPanel } from "./parts/tabs-panel";

const tabItems = [
	{ value: "appearance", label: "外观" },
	{ value: "layout", label: "布局" },
	{ value: "tabs", label: "标签" },
	{ value: "common", label: "通用" },
];

export function UIPreferencesPreview() {
	const preferences = useUIPreferences("preferences");
	const updatePreferences = useUIPreferences((state) => state.updatePreferences);
	const resetPreview = useUIPreferences((state) => state.resetPreview);
	const [copied, setCopied] = useState(false);

	if (!preferences.templatePreview.enabled) return null;

	const openPanel = () => {
		updatePreferences((draft) => {
			draft.templatePreview.panelOpen = true;
		});
	};

	const closePanel = () => {
		updatePreferences((draft) => {
			draft.templatePreview.panelOpen = false;
		});
	};

	const copyConfig = async () => {
		const value = JSON.stringify(uiPreferencesStore.store.getState().preferences, null, 2);
		await navigator.clipboard.writeText(value);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1200);
	};

	return (
		<>
			<Button
				type="button"
				size="icon"
				className="fixed right-5 bottom-5 z-100 rounded-full shadow-lg"
				title="偏好设置"
				onClick={openPanel}
			>
				<Settings2 className="size-4" />
			</Button>
			{preferences.templatePreview.panelOpen && (
				<div
					className={cn(
						"fixed inset-y-0 right-0 z-101 flex w-[min(440px,calc(100vw-16px))] flex-col border-l bg-background shadow-xl",
					)}
				>
					<div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
						<div>
							<div className="font-medium">偏好设置</div>
							<div className="text-xs text-muted-foreground">模板预览，实时生效</div>
						</div>
						<Button type="button" variant="ghost" size="icon" onClick={closePanel}>
							<X className="size-4" />
						</Button>
					</div>

					<Tabs defaultValue="appearance" className="min-h-0 flex-1 gap-0">
						<div className="shrink-0 border-b px-4 py-3">
							<TabsList className="grid h-9 w-full grid-cols-4">
								{tabItems.map((item) => (
									<TabsTrigger key={item.value} value={item.value}>
										{item.label}
									</TabsTrigger>
								))}
							</TabsList>
						</div>

						<div className="min-h-0 flex-1 overflow-y-auto p-4">
							<TabsContent value="appearance">
								<AppearancePanel preferences={preferences} updatePreferences={updatePreferences} />
							</TabsContent>
							<TabsContent value="layout">
								<LayoutPanel preferences={preferences} updatePreferences={updatePreferences} />
							</TabsContent>
							<TabsContent value="tabs">
								<TabsPanel preferences={preferences} updatePreferences={updatePreferences} />
							</TabsContent>
							<TabsContent value="common">
								<CommonPanel preferences={preferences} updatePreferences={updatePreferences} />
							</TabsContent>
						</div>
					</Tabs>

					<div className="flex h-16 shrink-0 items-center gap-3 border-t px-4">
						<Button type="button" className="flex-1" onClick={copyConfig}>
							{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
							复制配置
						</Button>
						<Button type="button" variant="outline" className="flex-1" onClick={resetPreview}>
							<RotateCcw className="size-4" />
							重置
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
