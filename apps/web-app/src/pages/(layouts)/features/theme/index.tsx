import React from 'react';
import ThemeProvider, { useTheme } from '@rap/components-ui/theme-provider';
import { ToggleGroup, ToggleGroupItem } from '@rap/components-base/toggle-group';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/(layouts)/features/theme/")({
	component: ThemePageFeature,
});

const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, themes, setTheme, systemTheme } = useTheme();

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-foreground">主题切换</h3>
      <ToggleGroup 
        type="single" 
        value={theme} 
        onValueChange={(value) => value && setTheme(value)}
        className="w-full"
      >
        {themes.map((t) => (
          <ToggleGroupItem
            key={t}
            value={t}
            variant="outline"
            size="sm"
            className="flex-1 text-foreground"
          >
            {t}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div>当前主题: {theme}</div>
				<div>当前解析主题: {resolvedTheme}</div>
        <div>系统主题: {systemTheme}</div>
      </div>
    </div>
  );
};

function ThemePageFeature () {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h2 className="text-2xl font-bold text-foreground">主题切换功能展示</h2>
      
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">1. 基础主题切换</h3>
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      </section>

      <section className="space-y-4">
				<div className="p-6 bg-card rounded-lg shadow-sm border">
					<h3 className="text-lg font-medium text-foreground mb-4">2. 单独控制区域</h3>
					<ThemeProvider
						storageKey="rap-isolated-theme" 
						isIsolated={true} 
						enableSystem={true}
						attributes="class"
						asChild="section"
					>
						<ThemeToggle />
					</ThemeProvider>
				</div>
      </section>
 			<section className="space-y-4">
				<div className="p-6 bg-card rounded-lg shadow-sm border">
					<h3 className="text-lg font-medium text-foreground mb-4">3. 强制主题</h3>
					<ThemeProvider
						storageKey="rap-forced-theme"
						enableSystem={true}
						attributes="class"
						asChild="section"
						forcedTheme="light"
					>
						<ThemeToggle />
					</ThemeProvider>
				</div>
      </section>
    </div>
  );
};
