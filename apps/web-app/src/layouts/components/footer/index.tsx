import { useUIPreferences } from "@/store/ui-preferences";

export function Footer() {
  const preferences = useUIPreferences("preferences");

  return (
    <footer className="flex h-(--app-footer-height) w-full shrink-0 items-center justify-center bg-transparent text-center text-secondary-foreground">
      ©{new Date().getFullYear()} {preferences.layout.footer.text}
    </footer>
  );
}
