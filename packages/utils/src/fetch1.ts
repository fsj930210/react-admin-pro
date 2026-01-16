import ky, { type KyInstance, type Options as KyOptions, type KyResponse } from 'ky';
import { toast } from 'sonner';
/**
 * 成功状态码
 */
const SUCCESS_CODE = '0000000000';

/**
 * Token 存储键名
 */
const TOKEN_KEY = 'token';

/**
 * 常用 Content-Type 常量
 */
export const ContentType = {
  json: 'application/json',
  form: 'application/x-www-form-urlencoded;charset=UTF-8',
  upload: 'multipart/form-data',
  download: 'application/octet-stream',
  downloadZip: 'application/zip',
  stream: 'text/event-stream',
} as const;

/**
 * 响应类型
 */
export type ResponseType = 'json' | 'blob' | 'text' | 'arrayBuffer';

/**
 * 上传进度回调类型
 */
export type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * 下载进度回调类型
 */
export type DownloadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percentage: number;
}) => void;

/**
 * 错误提示处理函数类型
 */
export type ErrorHandler = (error: string | Error | { message: string; code?: string; data?: any }) => void;



/**
 * 请求配置选项
 */
export interface FetchOptions extends Omit<KyOptions, 'searchParams' | 'json' | 'body' | 'onDownloadProgress' | 'onUploadProgress'> {
  /**
   * GET 请求参数
   */
  params?: Record<string, unknown>;
  
  /**
   * POST/PUT/PATCH 请求体
   */
  body?: unknown;
  
  /**
   * 是否返回原始 Response 对象
   * @default false
   */
  rawResponse?: boolean;
  
  /**
   * 响应类型
   * @default 'json'
   */
  responseType?: ResponseType;
  
  /**
   * 是否显示错误提示
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
   * 上传进度回调
   */
  onUploadProgress?: UploadProgressCallback;
  
  /**
   * 下载进度回调
   */
  onDownloadProgress?: DownloadProgressCallback;
  
  /**
   * 自定义错误处理函数
   */
  onError?: ErrorHandler;
  
  /**
   * 获取AbortController的回调函数
   * @description 如果提供此函数，则会创建AbortController并通过回调返回，用于取消请求
   */
  getAbortController?: (controller: AbortController) => void;
}

/**
 * 从 localStorage 获取 token
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}



/**
 * 标准响应结构
 */
export interface ApiResponse<T = unknown> {
  code: string;
  message?: string;
  data?: T;
}


async function readResponseWithProgress(
  response: Response,
  onProgress: DownloadProgressCallback
): Promise<ArrayBuffer> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const contentLength = Number(response.headers.get('Content-Length')) || 0;
  let loaded = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;

    chunks.push(value);
    loaded += value.length;

    // 触发进度回调
    onProgress({
      loaded,
      total: contentLength,
      percentage: contentLength ? Math.round((loaded / contentLength) * 100) : 0,
    });
  }

  // 合并所有 chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result.buffer;
}

function beforeRequestAuthorization(request: Request) {
  const token = getToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
}

const  beforeRequestRemoveContentType = (request: Request) =>{
  if (request.headers.has('Content-Type')) {
    request.headers.delete('Content-Type');
  }
}

function beforeErrorToast(options: FetchOptions) {
  return async (error: any) => {
		if (!options.silent) {
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
function afterResponse204(_request: Request, _options: KyOptions, response: Response) {
  if (response.status === 204) {
    return Response.json({ code: SUCCESS_CODE, message: '成功', data: null });
  }
}


/**
 * HTTP 请求客户端类
 */
export class HttpClient {
  private client: KyInstance;
  private defaultOptions: FetchOptions;
  private errorHandler: ErrorHandler;

  constructor(options: FetchOptions = {}) {
		console.log('options', options);
    this.defaultOptions = {
      silent: true,
      rawResponse: false,
      responseType: 'json',
      ...options,
    };
    
    this.errorHandler = options.onError || ((e: any) => { console.log(e) });

    const { 
			params, 
			body, 
			rawResponse, 
			responseType, 
			removeContentType,
			onError, 
			onUploadProgress, 
			onDownloadProgress, 
			...kyOptions 
		} = options;

    this.client = ky.create({
      ...kyOptions,
      hooks: {
        ...kyOptions.hooks,
        beforeRequest: [
          ...(kyOptions.hooks?.beforeRequest || []),
          beforeRequestAuthorization,
      		...(removeContentType ? [beforeRequestRemoveContentType] : []),
        ].filter(Boolean),
        beforeError: [
          ...(kyOptions.hooks?.beforeError || []),
					beforeErrorToast(options),
        ],
				afterResponse: [
					afterResponse204,
					...(kyOptions.hooks?.afterResponse || []),
				],
      },
    });
  }

  private async request<T = unknown>(
    url: string,
    options: FetchOptions & { rawResponse: true; responseType?: ResponseType }
  ): Promise<KyResponse<T>>;

  private async request<T = unknown>(
    url: string,
    options: FetchOptions & { rawResponse?: false; responseType: 'blob' }
  ): Promise<Blob>;

  private async request<T = unknown>(
    url: string,
    options: FetchOptions & { rawResponse?: false; responseType: 'text' }
  ): Promise<string>;

  private async request<T = unknown>(
    url: string,
    options: FetchOptions & { rawResponse?: false; responseType: 'arrayBuffer' }
  ): Promise<ArrayBuffer>;

  private async request<T = unknown>(
    url: string,
    options?: FetchOptions
  ): Promise<ApiResponse<T>>;

  private async request<T = unknown>(
    url: string,
    options: FetchOptions = {}
  ): Promise<KyResponse<T> | Blob | string | ArrayBuffer | ApiResponse<T>> {
    const mergedOptions: FetchOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const {	
      params,
      body,
      rawResponse,
      responseType = 'json',
      removeContentType,
			silent,
      onError,
      onUploadProgress,
      onDownloadProgress,
      getAbortController,
      ...kyOptions
    } = mergedOptions;
    if (getAbortController) {
      const controller = new AbortController();
      kyOptions.signal = controller.signal;
      getAbortController(controller);
    }

    if (params) {
      (kyOptions as KyOptions).searchParams = params as Record<string, string>;
    }

    if (body !== undefined) {
      if (body instanceof FormData) {
        (kyOptions as KyOptions).body = body;
      } else {
        (kyOptions as KyOptions).json = body;
      }
    }
    
    if (removeContentType && kyOptions.headers) {
      const headers = kyOptions.headers as Record<string, string>;
      delete headers['Content-Type'];
      delete headers['content-type'];
    }
    
    try {
      const res = await this.client<T>(url, kyOptions);
      if (rawResponse) {
        return res;
      }
      if (responseType === 'blob') {
        return await res.blob();
      }
      if (responseType === 'text') {
        return await res.text();
      }
      if (responseType === 'arrayBuffer') {
        return await res.arrayBuffer();
      }
      const resJson =  await res.json<ApiResponse<T>>();
			if (resJson.code !== SUCCESS_CODE) {
				// const errorData = {
				// 	message: resJson.message || '请求失败',
				// 	code: resJson.code,
				// 	data: resJson.data,
				// }
				// this.errorHandler(errorData);
				// onError?.(errorData);
				// if (silent) {
				// 	toast.error(resJson.message || '请求失败');
				// }
				throw resJson;
			}
			return resJson;
    } catch (error: any) {
      console.error(`[HttpClient Error]: `, error instanceof Error, error.message);
      this.errorHandler(error);
			onError?.(error);
      throw error;
    }
  }

  get<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>>;

  get<T = unknown>(url: string, options: FetchOptions & { rawResponse: true }): Promise<KyResponse<T>>;
  get<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'blob' }): Promise<Blob>;
  get<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'text' }): Promise<string>;
  get<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'arrayBuffer' }): Promise<ArrayBuffer>;
  get<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T> | KyResponse<T> | Blob | string | ArrayBuffer> {
    return this.request<T>(url, { ...options, method: 'get' });
  }

  post<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>>;
  post<T = unknown>(url: string, options: FetchOptions & { rawResponse: true }): Promise<KyResponse<T>>;
  post<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'blob' }): Promise<Blob>;
  post<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'text' }): Promise<string>;
  post<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'arrayBuffer' }): Promise<ArrayBuffer>;
  post<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T> | KyResponse<T> | Blob | string | ArrayBuffer> {
    return this.request<T>(url, { ...options, method: 'post' });
  }

  put<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>>;
  put<T = unknown>(url: string, options: FetchOptions & { rawResponse: true }): Promise<KyResponse<T>>;
  put<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'blob' }): Promise<Blob>;
  put<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'text' }): Promise<string>;
  put<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'arrayBuffer' }): Promise<ArrayBuffer>;
  put<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T> | KyResponse<T> | Blob | string | ArrayBuffer> {
    return this.request<T>(url, { ...options, method: 'put' });
  }

  patch<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>>;
  patch<T = unknown>(url: string, options: FetchOptions & { rawResponse: true }): Promise<KyResponse<T>>;
  patch<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'blob' }): Promise<Blob>;
  patch<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'text' }): Promise<string>;
  patch<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'arrayBuffer' }): Promise<ArrayBuffer>;
  patch<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T> | KyResponse<T> | Blob | string | ArrayBuffer> {
    return this.request<T>(url, { ...options, method: 'patch' });
  }

  delete<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string, options: FetchOptions & { rawResponse: true }): Promise<KyResponse<T>>;
  delete<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'blob' }): Promise<Blob>;
  delete<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'text' }): Promise<string>;
  delete<T = unknown>(url: string, options: FetchOptions & { rawResponse?: false; responseType: 'arrayBuffer' }): Promise<ArrayBuffer>;
  delete<T = unknown>(url: string, options?: FetchOptions): Promise<ApiResponse<T> | KyResponse<T> | Blob | string | ArrayBuffer> {
    return this.request<T>(url, { ...options, method: 'delete' });
  }

  async download(
    url: string,
    options: FetchOptions & {
      responseType: 'blob';
      onDownloadProgress?: DownloadProgressCallback;
    }
  ): Promise<Blob>;

  async download(
    url: string,
    options: FetchOptions & {
      responseType: 'arrayBuffer';
      onDownloadProgress?: DownloadProgressCallback;
    }
  ): Promise<ArrayBuffer>;

  async download(
    url: string,
    options?: FetchOptions & {
      responseType?: 'blob' | 'arrayBuffer';
      onDownloadProgress?: DownloadProgressCallback;
    }
  ): Promise<Blob | ArrayBuffer> {
    const { onDownloadProgress, responseType = 'blob', ...restOptions } = options || {};

    const { 
      params, 
      silent, 
      onError, 
      onUploadProgress, 
      getAbortController, 
      body, 
      ...kyOptions 
    } = restOptions;

    if (getAbortController) {
      const controller = new AbortController();
      kyOptions.signal = controller.signal;
      getAbortController(controller);
    }

    if (params) {
      (kyOptions as KyOptions).searchParams = params as Record<string, string>;
    }

    const token = getToken();
    if (token) {
      const headers = kyOptions.headers as Record<string, string> || {};
      headers['Authorization'] = `Bearer ${token}`;
      kyOptions.headers = headers;
    }

    const response = await this.client(url, {
      ...kyOptions,
      method: 'get',
      headers: {
        ...kyOptions.headers,
        'Content-Type': ContentType.download,
      },
    });

    if (onDownloadProgress) {
      const arrayBuffer = await readResponseWithProgress(response, onDownloadProgress);
      if (responseType === 'blob') {
        return new Blob([arrayBuffer]);
      }
      return arrayBuffer;
    }

    if (responseType === 'blob') {
      return await response.blob();
    }
    return await response.arrayBuffer();
  }

  upload<T = unknown>(
    url: string,
    options?: FetchOptions & {
      file?: File | Blob;
      fileFieldName?: string;
      data?: Record<string, unknown>;
    }
  ): Promise<ApiResponse<T>>;

  upload<T = unknown>(
    url: string,
    options?: FetchOptions & {
      file?: File | Blob;
      fileFieldName?: string;
      data?: Record<string, unknown>;
      onUploadProgress?: UploadProgressCallback;
    }
  ): Promise<ApiResponse<T>> {
    const { file, fileFieldName = 'file', data, onUploadProgress, getAbortController, ...restOptions } = options || {};

    // 构建 FormData
    const formData = new FormData();
    if (file) {
      formData.append(fileFieldName, file);
    }
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    // 如果没有进度回调，直接使用普通请求
    if (!onUploadProgress) {
      return this.request<T>(url, {
        ...restOptions,
        method: 'post',
        body: formData,
        removeContentType: true, // FormData 需要移除 Content-Type 让浏览器自动设置
      });
    }

    const { silent = true, onError } = restOptions;

  
    const dataPromise = new Promise<T | ApiResponse<T>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      if (getAbortController) {
        const controller = new AbortController();
        controller.signal.addEventListener('abort', () => {
          xhr.abort();
        });
        
        getAbortController(controller);
      }

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onUploadProgress) {
          onUploadProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      xhr.addEventListener('load', () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText) as ApiResponse<T>;
            
            if (data.code !== SUCCESS_CODE) {
             
              const errorObj = {
                message: data.message || '请求失败',
                code: data.code,
                data: data,
              };
              onError?.(errorObj);
							this.errorHandler(errorObj);
							if (silent) {
								toast.error(errorObj.message);
							}
            }
            resolve(data);
          } else {
            const errorObj = {
              message: `HTTP error! status: ${xhr.status}`,
              code: xhr.status.toString(),
              data: null,
            };
            if (silent) {
              toast.error(errorObj.message);
            }
						onError?.(errorObj);
						this.errorHandler(errorObj);
            reject(new Error(errorObj.message));
          }
        } catch (error) {
          reject(error);
        }
      });

      // 错误监听
      xhr.addEventListener('error', () => {
        const errorMessage = '上传失败';
        if (silent) {
          toast.error(errorMessage);
        }
				onError?.(errorMessage);
				this.errorHandler(errorMessage);
        reject(new Error(errorMessage));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', url);

      const token = getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      if (restOptions.headers) {
        Object.entries(restOptions.headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, String(value));
          }
        });
      }

      xhr.send(formData);
    });
    return dataPromise as Promise<ApiResponse<T>>;
  }

  sse(
    url: string,
    options: FetchOptions & {
      onMessage: (data: string) => void;
      onError?: (error: Error) => void;
      onEnd?: () => void;
    }
  ): { abort: () => void } {
    const { onMessage, onError, onEnd, body, ...restOptions } = options;
    const controller = new AbortController();

    // 提取自定义选项
    const { params, rawResponse, responseType, silent = true, onUploadProgress, onDownloadProgress, ...kyOptions } = restOptions;

    const finalOptions: KyOptions = {
      ...kyOptions,
      method: 'post',
      signal: controller.signal,
      headers: {
        ...kyOptions.headers,
        'Content-Type': ContentType.json,
        Accept: ContentType.stream,
      },
    };

    // 处理请求体
    if (body !== undefined) {
      finalOptions.json = body;
    }

    // 立即开始请求
    (async () => {
      try {
        const response = await this.client(url, finalOptions);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onEnd?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // 保留最后一行（可能不完整）
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith(':')) {
              continue;
            }

            if (trimmedLine.startsWith('data:')) {
              const data = trimmedLine.slice(5).trim();
              if (data === '[DONE]') {
                onEnd?.();
                return;
              }
              onMessage(data);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          onError?.(error);
        }
      }
    })();

    // 返回中止函数
    return {
      abort: () => controller.abort(),
    };
  }
}

/**
 * 创建 HTTP 客户端实例
 */
export function createHttpClient(options?: FetchOptions): HttpClient {
	console.log('createHttpClient options', options);
  return new HttpClient(options);
}

/**
 * 默认 HTTP 客户端实例
 */
export const httpClient = createHttpClient();
