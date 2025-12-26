import { httpClient } from '@rap/utils/fetch';

export interface ILoginRequestData {
  username: string;
  password: string;
	remember?: boolean;
}

export interface ILoginResponseData {
  token: string;
}


export const login = (data: ILoginRequestData) => {
  return httpClient.post<ILoginResponseData>('/api/rap/login', { body: data });	
}
