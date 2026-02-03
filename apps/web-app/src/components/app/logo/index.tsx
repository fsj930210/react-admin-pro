import { APP_BASE_PATH } from "@/config";
import { Logo, type LogoProps } from "@rap/components-ui/logo";


export function AppLogo (props: LogoProps) {
	return (
		<Logo {...props} url={`${APP_BASE_PATH}/logo.svg`} />
	)
}
