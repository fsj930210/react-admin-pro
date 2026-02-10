import type { MenuItem } from "@/layouts/types";
import request from "@/service/fetch";
export interface ILoginRequestData {
	username: string;
	password: string;
	remember?: boolean;
}

export interface ILoginResponseData {
	token: string;
}

export interface ILogoutResponseData {
	success: boolean;
}

export interface IUserInfoResponseData {
	id: string;
	username: string;
	gender: number;
	avatar: string;
	phone: string;
	email: string;
}

export type IUserMenusResponseData = MenuItem[];
/**
 * 用户登录
 */
export const login = (data: ILoginRequestData) => {
	return request.post<ILoginResponseData>("/api/rap/login", { data: data });
};

/**
 * 用户登出
 */
export const logout = () => {
	return request.post<ILogoutResponseData>("/api/rap/logout", {});
};

/**
 * 获取用户信息
 */
export const fetchUserInfo = () => {
	return request.get<IUserInfoResponseData>("/api/rap/user/info");
};
/**
 * 获取用户菜单
 */
export const fetchUserMenus = () => {
	return request.get<IUserMenusResponseData>("/api/rap/user/menus");
};

