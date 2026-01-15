import {  type ApiResponse } from '@rap/utils/fetch';
import request from '@/service/fetch';
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

/**
 * 用户登录 API
 */
export const login = (data: ILoginRequestData): Promise<ApiResponse<ILoginResponseData>> => {
  return request.post<ILoginResponseData>('/api/rap/login', { body: data });
};

/**
 * 用户登出 API
 */
export const logout = (): Promise<ApiResponse<ILogoutResponseData>> => {
  return request.post<ILogoutResponseData>('/api/rap/logout', {});
};


export const fetchUserInfo = (): Promise<ApiResponse<IUserInfoResponseData>> => {
  return request.get<IUserInfoResponseData>('/api/rap/user/info', {removeContentType: true});
};
