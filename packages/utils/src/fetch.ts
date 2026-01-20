import ky, { type KyInstance, type Options as KyOptions, type KyResponse, type SearchParamsOption } from 'ky';
import { toast } from 'sonner';

const DEFAULT_SUCCESS_CODE = '0000000000';

export const ContentType = {
  json: 'application/json',
  form: 'application/x-www-form-urlencoded;charset=UTF-8',
  upload: 'multipart/form-data',
  download: 'application/octet-stream',
  downloadZip: 'application/zip',
  stream: 'text/event-stream',
} as const;

export type ResponseType = 'json' | 'blob' | 'text' | 'arrayBuffer' | 'FormData' | 'bytes';


export interface DefaultAuthConfig {
  enabled?: boolean;
  tokenStorageKey?: string;
  headerKey?: string;
	defaultType?: string;
  getTokenHeaderValue?: () => string;
}

export interface DefaultJsonConfig {
  enabled?: boolean;
  defaultSuccessCode?: string | number;
}

// 请求配置选项
export interface FetchOptions extends KyOptions {
  /**
   * GET 请求参数（与searchParams二选一）
   */
  params?: SearchParamsOption;


	data?: BodyInit | unknown | null;
  /**
   * 是否将请求体转换为JSON
   */
  bodyStringify?: boolean;
  
  /**
   * 是否弹出错误
   * @default true
   */
  silent?: boolean;
  
  /**
   * 是否移除 Content-Type 头部
   * @description 用于 multipart/form-data 等场景，让浏览器或库自动设置正确的 Content-Type
   * @default false
   */
  removeContentType?: boolean;
  
  /**
   * 认证相关配置
   */
  defaultAuthConfig?: DefaultAuthConfig;
  
  /**
   * JSON响应相关配置
   */
  defaultJsonConfig?: DefaultJsonConfig;
}

/**
 * 标准响应结构
 */
export interface ApiResponse<T = unknown> {
  code: string;
  message: string;
  data: T;
}

function getDefaultAuthHeader(tokenStorageKey: string, defaultType: string): string{
  if (typeof window === 'undefined') return '';
  const token =  localStorage.getItem(tokenStorageKey);
	if (token) {
		return `${defaultType} ${token}`;
	}
	return ''
}

function beforeRequestDefaultAuthorization(
  options: FetchOptions
) {
	return (request: Request) => {
		const { 
			enabled, 
			tokenStorageKey = 'token', 
			headerKey = 'Authorization', 
			defaultType = 'Bearer', 
			getTokenHeaderValue 
		} = options.defaultAuthConfig || {};
		if (!enabled) return;
		const getTokenFn = getTokenHeaderValue || (() => getDefaultAuthHeader(tokenStorageKey, defaultType));
		const token = getTokenFn();
		if (token) {
			request.headers.set(headerKey, token);
		}
	}
}

/**
 * 请求前移除Content-Type头部
 */
const beforeRequestRemoveContentType = (request: Request) => {
  if (request.headers.has('Content-Type')) {
    request.headers.delete('Content-Type');
  }
};

/**
 * 错误提示处理
 */
function beforeErrorToast({ silent = true }: FetchOptions) {
	return async (error: any) => {
		if (!silent) {
			const { response } = error;
			if (response) {
				try {
					const body = await response.json();
					error.message = body.message || error.message;
				} catch (e: any){
					error.message = e.message || error.message;
				}
				toast.error(error.message || '请求失败');
			}
			return error;
		}
	}
}


function afterResponseDefaultJson(options: FetchOptions) {
	return async (_request: Request, _options:KyOptions, response: Response) => {
		const { silent } = options
		const { enabled, defaultSuccessCode = DEFAULT_SUCCESS_CODE } = options.defaultJsonConfig || {};
		if (!enabled) return;
		try {
			const clonedResponse =  response.clone();
			if (clonedResponse.status >= 200 && clonedResponse.status < 300) {
				const body = await clonedResponse.json();
				if (body.code !== defaultSuccessCode) {
					if (!silent) {
						toast.error(body.message || '请求失败');
					}
					return Promise.reject(body);
				}
				return body;
			}
		} catch (e: any){
			if (!silent) {
				toast.error(e?.message || '请求失败');
			}
			return Promise.reject(e);
		}
	}
}
/**
 * HTTP 请求客户端类
 */
export class FetchClient {
  private client: KyInstance;
  private defaultOptions: FetchOptions;

  constructor(options: FetchOptions = {}) {
    // 设置默认配置
    const defaultAuthConfig: DefaultAuthConfig = {
      enabled: true,
      tokenStorageKey: 'token',
      headerKey: 'Authorization',
      defaultType: 'Bearer',
      getTokenHeaderValue: undefined,
    };

    const defaultJsonConfig: DefaultJsonConfig = {
      enabled: true,
      defaultSuccessCode: DEFAULT_SUCCESS_CODE,
    };

    this.defaultOptions = {
      silent: true,
      removeContentType: false,
      defaultAuthConfig: { ...defaultAuthConfig, ...options.defaultAuthConfig },
      defaultJsonConfig: { ...defaultJsonConfig, ...options.defaultJsonConfig },
      ...options,
    };
    const { 
      params,
      bodyStringify,
      silent,
      removeContentType,
      ...restOptions
    } = this.defaultOptions;
    this.client = ky.create({
      ...restOptions,
      hooks: {
        ...restOptions.hooks,
        beforeRequest: [
          beforeRequestDefaultAuthorization(this.defaultOptions),
          ...(removeContentType ? [beforeRequestRemoveContentType] : []),
          ...(restOptions.hooks?.beforeRequest || []),
        ].filter(Boolean),
        afterResponse: [
          ...(restOptions.hooks?.afterResponse || []),
        ].filter(Boolean),
        beforeError: [
          ...(restOptions.hooks?.beforeError || []),
          beforeErrorToast(this.defaultOptions),
        ].filter(Boolean),
      },
    });
  }

  /**
   * 核心请求方法，只返回原始response
   */
  private async request<T = unknown>(
    url: string,
    options: FetchOptions
  ): Promise<KyResponse<T>> {
    const mergedOptions: FetchOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const { 
      params,
			data,
      bodyStringify = true,
			credentials = 'include',
    } = mergedOptions;


    if (params) {
      mergedOptions.searchParams = params;
    }
		if (bodyStringify) {
			mergedOptions.json = data;
		} else {
			mergedOptions.body = data as BodyInit;
		}
		mergedOptions.credentials = credentials;
    return this.client<T>(url, mergedOptions);
  }

  /**
   * 获取JSON响应
   * @returns 具体类型的响应数据
   */
  async fetchJson<T = unknown>(
    url: string,
    options: FetchOptions
  ): Promise<ApiResponse<T>> {
    const response = await this.request<T>(url, {
		...options,
		hooks: {
			...options.hooks,
			afterResponse: [
				afterResponseDefaultJson({...this.defaultOptions, ...options}),
				...(options.hooks?.afterResponse || []),
			],
		}
	});
    return response.json<ApiResponse<T>>();
  }

  /**
   * 获取Blob响应
   */
  async fetchBlob(
    url: string,
    options: FetchOptions & { method: string }
  ): Promise<Blob> {
    const response = await this.request(url, options);
    return response.blob();
  }

  /**
   * 获取ArrayBuffer响应
   */
  async fetchArrayBuffer(
    url: string,
    options: FetchOptions & { method: string }
  ): Promise<ArrayBuffer> {
    const response = await this.request(url, options);
    return response.arrayBuffer();
  }

  /**
   * 获取Text响应
   */
  async fetchText(
    url: string,
    options: FetchOptions
  ): Promise<string> {
    const response = await this.request(url, options);
    return response.text();
  }
  /**
   * 获取Bytes响应
   */
  async fetchBytes(
    url: string,
    options: FetchOptions
  ): Promise<Uint8Array> {
    const response = await this.request(url, options);
    return response.bytes();
  }
	  /**
   * 获取FormData响应
   */
  async fetchFormData(
    url: string,
    options: FetchOptions
  ):  Promise<FormData> {
    const response = await this.request(url, options);
    return response.formData();
  }
  /**
   * GET 请求
   */
  get<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.fetchJson<T>(url, { ...options, method: 'get' });
  }

  /**
   * POST 请求
   */
  post<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.fetchJson<T>(url, { ...options, method: 'post' });
  }

  /**
   * PUT 请求
   */
  put<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.fetchJson<T>(url, { ...options, method: 'put' });
  }

  /**
   * PATCH 请求
   */
  patch<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.fetchJson<T>(url, { ...options, method: 'patch' });
  }

  /**
   * DELETE 请求
   */
  delete<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    return this.fetchJson<T>(url, { ...options, method: 'delete' });
  }
}

/**
 * 创建HTTP客户端实例
 */
export function createFetchClient(options?: FetchOptions): FetchClient {
  return new FetchClient(options);
}

/**
 * 默认HTTP客户端实例
 */
export const fetchClient = createFetchClient();