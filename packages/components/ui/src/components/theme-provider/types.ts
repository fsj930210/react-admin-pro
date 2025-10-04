type DataAttribute = `data-${string}`;

export type Attribute = DataAttribute | "class";

export interface ThemeStorage {
  [id: string]: string;
}
interface ScriptProps
  extends React.DetailedHTMLProps<
    React.ScriptHTMLAttributes<HTMLScriptElement>,
    HTMLScriptElement
  > {
  // biome-ignore lint:suspicious/noExplicitAny
  [dataAttribute: DataAttribute]: any;
}

export interface ThemeContextValue {
  theme: string;
  themes: string[];
  enableSystem: boolean;
  enableColorScheme: boolean;
  id: string;
  forcedTheme?: string;
  storageKey?: string;
  systemTheme?: string;
  themeScope?: string;
  cacheClearRecovery?: "default" | "system" | "none";
  defaultTheme?: string;
  refreshTheme: () => void;
  setTheme: (theme: string) => void;
  setFollowSystemTheme: (follow: boolean) => void;
  clearTheme: () => void;
  clearAllThemes: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  id: string;
  storageKey?: string;
  themes?: string[];
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  inheritTheme?: boolean;
  attribute?: Attribute;
  defaultTheme?: string;
  forcedTheme?: string;
  cacheClearRecovery?: "default" | "system" | "none";
  /** Nonce string to pass to the inline script and style elements for CSP headers */
  nonce?: string;
  /** Props to pass the inline script */
  scriptProps?: ScriptProps;
}
