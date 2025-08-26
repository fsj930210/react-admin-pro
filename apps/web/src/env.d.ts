/** biome-ignore-all lint:correctness/noUnusedVariables */

/// <reference types="@rsbuild/core/types" />

/// <reference types="vite/client" />

interface RsbuildTypeOptions {
	strictImportMetaEnv: true;
}

interface ImportMetaEnv {
	readonly RAP_WEB_APP_BASE_URL: string;
	readonly RAP_WEB_APP_TITLE: string;
	readonly RAP_WEB_APP_HOME_PATH: string;
	readonly RAP_WEB_APP_PORT: string;
	readonly RAP_WEB_BASE_API_PREFIX: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "*.svg" {
	const content: string;
	export default content;
}
declare module "*.svg?react" {
	const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
	export default ReactComponent;
}
