import type { Easing, Variants } from "framer-motion";

import { AnimatePresence, motion } from "framer-motion";
import type { PropsWithChildren, ReactNode } from "react";

// 预定义动画类型
export type AnimationType =
	| "fadeRight"
	| "fadeLeft"
	| "fadeTop"
	| "fadeBottom"
	| "fadeScale"
	| "custom";

// 变体覆盖类型（允许部分覆盖预定义变体）
type VariantOverride = Partial<Pick<Variants, "initial" | "animate" | "exit">>;

// 动画配置接口（包含覆盖和事件）
export interface AnimationConfig {
	type: AnimationType; // 动画类型
	duration?: number; // 动画时长（秒）
	delay?: number; // 延迟触发（秒）
	ease?: Easing; // 缓动函数
	variants?: VariantOverride; // 变体覆盖（部分属性）
	onAnimationStart?: () => void; // 动画开始回调
	onAnimationComplete?: () => void; // 动画完成回调
}

// 预定义基础变体（可被覆盖）
const baseVariants: Record<Exclude<AnimationType, "custom">, Variants> = {
	fadeRight: {
		initial: { x: 50, opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: 50, opacity: 0 },
	},
	fadeLeft: {
		initial: { x: -50, opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: -50, opacity: 0 },
	},
	fadeTop: {
		initial: { y: -50, opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: -50, opacity: 0 },
	},
	fadeBottom: {
		initial: { y: 50, opacity: 0 },
		animate: { y: 0, opacity: 1 },
		exit: { y: 50, opacity: 0 },
	},
	fadeScale: {
		initial: { scale: 0.9, opacity: 0 },
		animate: { scale: 1, opacity: 1 },
		exit: { scale: 0.9, opacity: 0 },
	},
};

interface RaAnimatorProps extends PropsWithChildren<{ children: ReactNode }> {
	config: AnimationConfig; // 必传动画配置
	animatekey?: string | number; // 用于AnimatePresence的唯一标识
	className?: string; // 自定义类名
}

const RaAnimator = ({ children, config, animatekey, className }: RaAnimatorProps) => {
	// 合并基础变体与覆盖配置
	const base = config.type === "custom" ? {} : baseVariants[config.type];
	const finalVariants: Variants = {
		initial: { ...base.initial, ...config.variants?.initial },
		animate: { ...base.animate, ...config.variants?.animate },
		exit: { ...base.exit, ...config.variants?.exit },
	};

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={animatekey}
				variants={finalVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				transition={{
					duration: config.duration ?? 0.3,
					delay: config.delay ?? 0,
					ease: config.ease ?? "easeInOut",
				}}
				onAnimationStart={config.onAnimationStart}
				onAnimationComplete={config.onAnimationComplete}
				className={className}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
};

export default RaAnimator;
