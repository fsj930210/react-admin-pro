import { useUIPreferences } from "@/store/ui-preferences";

export function Footer() {
	const preferences = useUIPreferences("preferences");

	return (
		<footer className="flex w-full items-center justify-center bg-transparent text-center text-secondary-foreground h-(--app-footer-height)">
			©{new Date().getFullYear()} {preferences.layout.footer.text}
		</footer>
	);
}
