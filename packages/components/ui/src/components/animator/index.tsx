import type {
  AnimatePresenceProps,
  Easing,
  HTMLMotionProps,
  Transition,
  Variants,
} from "framer-motion";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import type { ElementType, ReactNode } from "react";

export type AnimatorPreset =
  | "none"
  | "fade"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-scale"
  | "zoom-fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "slide-left-fade"
  | "slide-right-fade"
  | "slide-up-fade"
  | "slide-down-fade"
  | "route-forward"
  | "route-back"
  | "overlay";

type VariantKey = "initial" | "animate" | "exit";
type VariantOverride = Partial<Pick<Variants, VariantKey>>;
type MotionTag = keyof typeof motion;

export interface AnimatorConfig {
  preset?: AnimatorPreset;
  duration?: number;
  exitDuration?: number;
  delay?: number;
  distance?: number;
  ease?: Easing;
  transition?: Transition;
  variants?: VariantOverride;
}

export interface RaAnimatorProps extends Omit<
  HTMLMotionProps<"div">,
  "as" | "children" | "transition" | "variants"
> {
  as?: MotionTag;
  children: ReactNode;
  animateKey?: string | number;
  config?: AnimatorConfig;
  preset?: AnimatorPreset;
  duration?: number;
  exitDuration?: number;
  delay?: number;
  distance?: number;
  ease?: Easing;
  transition?: Transition;
  variants?: VariantOverride;
}

export interface AnimatedPresenceProps extends RaAnimatorProps {
  show?: boolean;
  animateKey?: string | number;
  animatekey?: string | number;
  mode?: AnimatePresenceProps["mode"];
  initialPresence?: AnimatePresenceProps["initial"];
  presenceProps?: Omit<AnimatePresenceProps, "children">;
}

function mergeConfig(props: RaAnimatorProps): Required<AnimatorConfig> {
  const config = props.config ?? {};

  return {
    preset: props.preset ?? config.preset ?? "fade",
    duration: props.duration ?? config.duration ?? 0.24,
    exitDuration:
      props.exitDuration ?? config.exitDuration ?? props.duration ?? config.duration ?? 0.18,
    delay: props.delay ?? config.delay ?? 0,
    distance: props.distance ?? config.distance ?? 24,
    ease: props.ease ?? config.ease ?? [0.4, 0, 0.2, 1],
    transition: props.transition ?? config.transition ?? {},
    variants: {
      ...config.variants,
      ...props.variants,
    },
  };
}

function createPresetVariants(preset: AnimatorPreset, distance: number): Variants {
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const slide = (axis: "x" | "y", enter: number | string, exit = enter, opacity = 1): Variants => ({
    initial: { [axis]: enter, opacity },
    animate: { [axis]: 0, opacity: 1 },
    exit: { [axis]: exit, opacity },
  });

  switch (preset) {
    case "none":
      return {
        initial: {},
        animate: {},
        exit: {},
      };
    case "fade":
      return fade;
    case "fade-up":
      return slide("y", distance, -distance, 0);
    case "fade-down":
      return slide("y", -distance, distance, 0);
    case "fade-left":
      return slide("x", distance, -distance, 0);
    case "fade-right":
      return slide("x", -distance, distance, 0);
    case "fade-scale":
      return {
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
      };
    case "zoom-fade":
      return {
        initial: { opacity: 0, scale: 0.94 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.02 },
      };
    case "slide-left":
      return slide("x", "100%", "-100%");
    case "slide-right":
      return slide("x", "-100%", "100%");
    case "slide-up":
      return slide("y", "100%", "-100%");
    case "slide-down":
      return slide("y", "-100%", "100%");
    case "slide-left-fade":
      return slide("x", distance, -distance, 0);
    case "slide-right-fade":
      return slide("x", -distance, distance, 0);
    case "slide-up-fade":
      return slide("y", distance, -distance, 0);
    case "slide-down-fade":
      return slide("y", -distance, distance, 0);
    case "route-forward":
      return slide("x", distance, -distance * 0.6, 0);
    case "route-back":
      return slide("x", -distance, distance * 0.6, 0);
    case "overlay":
      return {
        initial: { opacity: 0, x: distance },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: distance },
      };
    default:
      return fade;
  }
}

function mergeVariants(base: Variants, override?: VariantOverride): Variants {
  return {
    initial: { ...(base.initial as object), ...(override?.initial as object) },
    animate: { ...(base.animate as object), ...(override?.animate as object) },
    exit: { ...(base.exit as object), ...(override?.exit as object) },
  };
}

export function createAnimatorVariants(config: AnimatorConfig = {}): Variants {
  const preset = config.preset ?? "fade";
  const distance = config.distance ?? 24;
  const variants = mergeVariants(createPresetVariants(preset, distance), config.variants);
  const exitDuration = config.exitDuration;

  if (typeof exitDuration !== "number") {
    return variants;
  }

  return {
    ...variants,
    exit: {
      ...(variants.exit as object),
      transition: {
        duration: exitDuration,
        ease: config.ease ?? [0.4, 0, 0.2, 1],
      },
    },
  };
}

export function createAnimatorTransition(config: AnimatorConfig = {}): Transition {
  const duration = config.duration ?? 0.24;
  const delay = config.delay ?? 0;
  const ease = config.ease ?? [0.4, 0, 0.2, 1];

  return {
    duration,
    delay,
    ease,
    ...config.transition,
  };
}

export function RaAnimator({
  as = "div",
  children,
  animateKey,
  config,
  preset,
  duration,
  exitDuration,
  delay,
  distance,
  ease,
  transition,
  variants,
  ...motionProps
}: RaAnimatorProps) {
  const finalConfig = mergeConfig({
    children,
    animateKey,
    config,
    preset,
    duration,
    exitDuration,
    delay,
    distance,
    ease,
    transition,
    variants,
  });
  const MotionComponent = motion[as] as ElementType;
  const controls = useAnimationControls();

  useEffect(() => {
    if (animateKey === undefined || finalConfig.preset === "none") return;

    controls.set("initial");
    void controls.start("animate");
  }, [animateKey, controls, finalConfig.preset]);

  return (
    <MotionComponent
      variants={createAnimatorVariants(finalConfig)}
      initial="initial"
      animate={animateKey === undefined ? "animate" : controls}
      exit="exit"
      transition={createAnimatorTransition(finalConfig)}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  );
}

export function AnimatedPresence({
  show = true,
  animateKey,
  animatekey,
  mode = "wait",
  initialPresence = false,
  presenceProps,
  children,
  ...animatorProps
}: AnimatedPresenceProps) {
  const key = animateKey ?? animatekey;

  return (
    <AnimatePresence mode={mode} initial={initialPresence} {...presenceProps}>
      {show ? (
        <RaAnimator key={key ?? "animated-presence"} {...animatorProps}>
          {children}
        </RaAnimator>
      ) : null}
    </AnimatePresence>
  );
}

export default AnimatedPresence;
