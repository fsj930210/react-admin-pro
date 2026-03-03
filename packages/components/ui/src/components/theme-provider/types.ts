type DataAttribute = `data-${string}`;

export type Attributes = DataAttribute | "class";
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
	resolvedTheme: string;
  forcedTheme?: string;
	systemTheme?: 'light' | 'dark';
  setTheme: (theme: string) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  storageKey?: string;
  themes?: string[];
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  inheritTheme?: boolean;
  attributes?: Attributes;
  defaultTheme?: string;
  forcedTheme?: string;
	className?: string;
	asChild?: string;
	isIsolated?: boolean;
  nonce?: string;
  scriptProps?: ScriptProps;
}
