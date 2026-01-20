import { createSetter, createStore, type SetterFunction } from "@rap/hooks/use-zustand";
export interface UserState {
	userInfo: {
		id: string;
		username: string;
		gender: number;
		avatar: string;
		phone: string;
		email: string;
	}
}

export interface UserActions {
	setUserInfo: SetterFunction<UserState, "userInfo">;
}
export type User = UserState & UserActions;

const { selector: useUserSelector } = createStore<User>(
	(set) => ({
		userInfo: {
			id: '',
			username: '',
			gender: 0,
			avatar: '',
			phone: '',
			email: '',
		},
		setUserInfo: createSetter<UserState, "userInfo">(set, "userInfo"),
	}),
	{
		name: "UserStore",
	},
);
export { useUserSelector };
