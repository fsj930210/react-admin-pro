export type LogoProps = {
	title?: string;
	showTitle?: boolean;
	url?: string;
	children?: React.ReactNode;
} & React.ComponentProps<"div">;
const Logo = ({
	url,
	title = "React Admin Pro",
	showTitle = true,
	children,
	...props
}: LogoProps) => {
	const defaultContent = (
		<div className="flex items-center gap-2" {...props}>
			<img
				src={url ?? '/logo.svg'}
				alt={title}
				className="object-contain"
			/>
			{showTitle && title && <h2 className="truncate font-medium text-base">{title}</h2>}
		</div>
	);

	return (
		children || defaultContent
	);
};

export { Logo };
