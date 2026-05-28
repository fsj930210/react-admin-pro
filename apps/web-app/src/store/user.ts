import { createStore } from "@rap/hooks/use-zustand";
export interface UserState {
	userInfo: {
		id: string;
		username: string;
		gender: number;
		avatar: string;
		phone: string;
		email: string;
	};
}

const userStore = createStore<UserState>(
	() => ({
		userInfo: {
			id: "",
			username: "",
			gender: 0,
			avatar: "",
			phone: "",
			email: "",
		},
	}),
	{
		name: "UserStore",
	},
);

const useUser = userStore.use;

export { userStore, useUser };
