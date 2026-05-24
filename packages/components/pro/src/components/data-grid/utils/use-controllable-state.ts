import { useCallback, useRef, useState } from "react";

interface ControllableStateOptions<TValue> {
	value?: TValue;
	defaultValue: TValue;
	onChange?: (value: TValue) => void;
	isEqual?: (a: TValue, b: TValue) => boolean;
}

/**
 * Small controlled/uncontrolled bridge used by every feature hook.
 *
 * The important behavior is that `defaultValue` is read only on the first render,
 * exactly like native uncontrolled inputs. When a controlled `value` is supplied,
 * the hook never mirrors it into local state, so parent updates remain the single
 * source of truth. The setter computes the TanStack updater once, compares it
 * with the current value, and skips both setState and onChange when nothing
 * changed. That keeps feature callbacks from causing a second render for no-op
 * interactions such as clicking the active page or selecting an already selected
 * row.
 */
export function useControllableState<TValue>({
	value,
	defaultValue,
	onChange,
	isEqual = Object.is,
}: ControllableStateOptions<TValue>) {
	const isControlled = value !== undefined;
	const defaultValueRef = useRef(defaultValue);
	const [innerValue, setInnerValue] = useState(defaultValueRef.current);
	const currentValue = isControlled ? (value as TValue) : innerValue;

	const setValue = useCallback(
		(updater: TValue | ((previous: TValue) => TValue)) => {
			const nextValue =
				typeof updater === "function" ? (updater as (previous: TValue) => TValue)(currentValue) : updater;

			if (isEqual(currentValue, nextValue)) {
				return nextValue;
			}

			if (!isControlled) {
				setInnerValue(nextValue);
			}
			onChange?.(nextValue);
			return nextValue;
		},
		[currentValue, isControlled, isEqual, onChange],
	);

	return [currentValue, setValue] as const;
}
