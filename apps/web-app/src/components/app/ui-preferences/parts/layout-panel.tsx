import { Button } from "@rap/components-ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@rap/components-ui/select";
import { Switch } from "@rap/components-ui/switch";
import { useState } from "react";
import type { ContentWidthMode, LayoutMode } from "@/config/ui-preferences";
import { contentWidthOptions, layoutOptions } from "./options";
import {
	controlClassName,
	Field,
	numberInputClassName,
	Section,
	selectContentClassName,
	textInputClassName,
} from "./shared";
import type { PreferencesPanelProps } from "./types";

export function LayoutPanel({ preferences, updatePreferences }: PreferencesPanelProps) {
	const [layoutModeDraft, setLayoutModeDraft] = useState<LayoutMode>();
	const selectedLayoutMode = layoutModeDraft ?? preferences.layout.mode;

	const applyLayoutMode = () => {
		updatePreferences((draft) => {
			draft.layout.mode = selectedLayoutMode;
		});
		setLayoutModeDraft(undefined);
		window.setTimeout(() => window.location.reload(), 80);
	};

	return (
		<div className="space-y-6">
			<Section title="布局模式">
				<Field label="默认布局" description="切换布局会刷新页面。">
					<div className="flex items-center gap-2">
						<Select
							value={selectedLayoutMode}
							onValueChange={(value) => setLayoutModeDraft(value as LayoutMode)}
						>
							<SelectTrigger className="w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className={selectContentClassName}>
								{layoutOptions.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							type="button"
							size="sm"
							disabled={selectedLayoutMode === preferences.layout.mode}
							onClick={applyLayoutMode}
						>
							应用
						</Button>
					</div>
				</Field>
				<Field label="内容宽度">
					<Select
						value={preferences.layout.contentWidth}
						onValueChange={(value) =>
							updatePreferences((draft) => {
								draft.layout.contentWidth = value as ContentWidthMode;
							})
						}
					>
						<SelectTrigger className={controlClassName}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className={selectContentClassName}>
							{contentWidthOptions.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				<Field label="内容边距">
					<input
						type="number"
						value={preferences.layout.contentPadding}
						min={0}
						max={48}
						className={numberInputClassName}
						onChange={(event) =>
							updatePreferences((draft) => {
								draft.layout.contentPadding = Number(event.target.value);
							})
						}
					/>
				</Field>
				<Field label="最大宽度">
					<input
						type="number"
						value={preferences.layout.maxContentWidth}
						min={960}
						max={1920}
						step={20}
						className={numberInputClassName}
						onChange={(event) =>
							updatePreferences((draft) => {
								draft.layout.maxContentWidth = Number(event.target.value);
							})
						}
					/>
				</Field>
			</Section>

			<Section title="侧边栏">
				<Field label="默认折叠">
					<Switch
						checked={preferences.layout.sidebar.defaultCollapsed}
						onCheckedChange={(checked) =>
							updatePreferences((draft) => {
								draft.layout.sidebar.defaultCollapsed = checked;
							})
						}
					/>
				</Field>
				<Field label="允许折叠">
					<Switch
						checked={preferences.layout.sidebar.collapsible}
						onCheckedChange={(checked) =>
							updatePreferences((draft) => {
								draft.layout.sidebar.collapsible = checked;
							})
						}
					/>
				</Field>
				<Field label="允许拖拽宽度">
					<Switch
						checked={preferences.layout.sidebar.resizable}
						onCheckedChange={(checked) =>
							updatePreferences((draft) => {
								draft.layout.sidebar.resizable = checked;
							})
						}
					/>
				</Field>
				<Field label="折叠按钮">
					<Switch
						checked={preferences.layout.sidebar.showTrigger}
						onCheckedChange={(checked) =>
							updatePreferences((draft) => {
								draft.layout.sidebar.showTrigger = checked;
							})
						}
					/>
				</Field>
				<Field label="展开宽度">
					<input
						type="number"
						value={preferences.layout.sidebar.width}
						min={preferences.layout.sidebar.minWidth}
						max={preferences.layout.sidebar.maxWidth}
						className={numberInputClassName}
						onChange={(event) =>
							updatePreferences((draft) => {
								draft.layout.sidebar.width = Number(event.target.value);
							})
						}
					/>
				</Field>
				<Field label="折叠宽度">
					<input
						type="number"
						value={preferences.layout.sidebar.collapsedWidth}
						min={44}
						max={80}
						className={numberInputClassName}
						onChange={(event) =>
							updatePreferences((draft) => {
								draft.layout.sidebar.collapsedWidth = Number(event.target.value);
							})
						}
					/>
				</Field>
			</Section>

			<Section title="顶栏与底栏">
				<Field label="顶栏高度">
					<input
						type="number"
						value={preferences.layout.header.height}
						min={40}
						max={72}
						className={numberInputClassName}
						onChange={(event) =>
							updatePreferences((draft) => {
								draft.layout.header.height = Number(event.target.value);
							})
						}
					/>
				</Field>
				<Field label="底栏">
					<Switch
						checked={preferences.layout.footer.enabled}
						onCheckedChange={(checked) =>
							updatePreferences((draft) => {
								draft.layout.footer.enabled = checked;
							})
						}
					/>
				</Field>
				<Field label="底栏文案">
					<input
						type="text"
						value={preferences.layout.footer.text}
						className={textInputClassName}
						onChange={(event) =>
							updatePreferences((draft) => {
								draft.layout.footer.text = event.target.value;
							})
						}
					/>
				</Field>
			</Section>
		</div>
	);
}
