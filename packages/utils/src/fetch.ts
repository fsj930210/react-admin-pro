import ky, { type KyInstance, type Options as KyOptions } from 'ky';
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
export type ResponseType = 'json' | 'blob' | 'text' | 'arrayBuffer' | 'formData';

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
 * 请求结果包装类型
 */
export interface RequestResult<T = unknown> {
  /**
   * 请求唯一 ID
   */
  requestId: string;

  /**
   * 请求 Promise
   */
  promise: Promise<ApiResponse<T>>;

  /**
   * 中止当前请求的函数
   */
  abort: () => void;
}

/**
 * 下载结果包装类型（用于返回原始数据如 Blob）
 */
export interface DownloadResult {
  /**
   * 请求唯一 ID
   */
  requestId: string;

  /**
   * 下载 Promise
   */
  promise: Promise<Blob>;

  /**
   * 中止当前请求的函数
   */
  abort: () => void;
}

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
  showError?: boolean;
  
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
}

/**
 * 标准响应结构
 */
export interface ApiResponse<T = unknown> {
  code: string;
  message?: string;
  data?: T;
}

/**
 * 生成唯一请求 ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * 请求管理器
 */
class RequestManager {
  private static requests = new Map<string, () => void>();
  
  /**
   * 添加请求
   */
  static add(id: string, abort: () => void): void {
    this.requests.set(id, abort);
  }
  
  /**
   * 移除请求
   */
  static remove(id: string): void {
    this.requests.delete(id);
  }
  
  /**
   * 批量取消请求
   */
  static abortByIds(ids: string[]): void {
    ids.forEach(id => {
      const abort = this.requests.get(id);
      if (abort) {
        abort();
        this.requests.delete(id);
      }
    });
  }
  
  /**
   * 取消所有请求
   */
  static abortAll(): void {
    this.requests.forEach(abort => abort());
    this.requests.clear();
  }
}

/**
 * 从 localStorage 获取 token
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 默认错误处理函数（使用 sonner toast）
 * 注意：需要在应用中引入 Toaster 组件
 */
let defaultErrorHandler: ErrorHandler = (error: string | Error | { message: string; code?: string; data?: any }): void => {
  // 动态导入 sonner 以避免 SSR 问题
  let errorMessage = '请求失败';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = error.message || '请求失败';
  }
  
  if (typeof window !== 'undefined') {
		toast.error(errorMessage);
  } else {
    console.error(`[HttpClient Error]: ${errorMessage}`);
  }
};

/**
 * 设置全局错误处理函数
 */
export function setGlobalErrorHandler(handler: ErrorHandler): void {
  defaultErrorHandler = handler;
}

/**
 * HTTP 请求客户端类
 */
export class HttpClient {
  private client: KyInstance;
  private defaultOptions: FetchOptions;
  private errorHandler: ErrorHandler;

  constructor(options: FetchOptions = {}) {
    this.defaultOptions = {
      showError: true,
      rawResponse: false,
      responseType: 'json',
      ...options,
    };
    
    this.errorHandler = options.onError || defaultErrorHandler;

    // 提取自定义选项
    const { 
			params, 
			body, 
			rawResponse, 
			responseType, 
			showError, 
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
          (request) => {
            // 添加 token
            const token = getToken();
            if (token) {
              request.headers.set('Authorization', `Bearer ${token}`);
            }
          },
        ],
        beforeError: [
          ...(kyOptions.hooks?.beforeError || []),
          async (error) => {
            const { response } = error;
            
            if (response) {
              try {
                const body = await response.json<ApiResponse>();
                error.message = body.message || error.message;
              } catch {
                // 无法解析响应体，保持原始错误信息
              }
            }
            
            return error;
          },
        ],
      },
    });
  }

  /**
   * 发起请求
   */
  private request<T = unknown>(
    url: string,
    options: FetchOptions = {}
  ): RequestResult<T> {
    const mergedOptions: FetchOptions = {
      ...this.defaultOptions,
      ...options,
    };

    const {
      params,
      body,
      rawResponse,
      responseType = 'json',
      showError,
      removeContentType,
      onError,
      onUploadProgress,
      onDownloadProgress,
      ...kyOptions
    } = mergedOptions;

    // 创建请求专用的中止控制器
    const controller = new AbortController();
    const requestId = generateRequestId();
    kyOptions.signal = controller.signal;
    
    const abort = () => controller.abort();
    
    // 添加到请求管理器
    RequestManager.add(requestId, abort);

    // 处理 GET 请求参数
    if (params) {
      (kyOptions as KyOptions).searchParams = params as Record<string, string>;
    }

    // 处理请求体
    if (body !== undefined) {
      if (body instanceof FormData) {
        (kyOptions as KyOptions).body = body;
      } else {
        (kyOptions as KyOptions).json = body;
      }
    }
    
    // 移除 Content-Type（用于 FormData 等场景）
    if (removeContentType && kyOptions.headers) {
      const headers = kyOptions.headers as Record<string, string>;
      delete headers['Content-Type'];
      delete headers['content-type'];
    }

    const dataPromise = (async () => {
      try {
        const response = await this.client(url, kyOptions as KyOptions);

        // 返回原始 Response 对象
        if (rawResponse) {
          return response;
        }

        // 根据响应类型处理
        if (responseType === 'blob') {
          return await response.blob();
        }

        if (responseType === 'text') {
          return await response.text();
        }

        if (responseType === 'arrayBuffer') {
          return await response.arrayBuffer();
        }

        if (responseType === 'formData') {
          return await response.formData();
        }

        // 默认 JSON 处理
        const data = await response.json<ApiResponse<T>>();

        // 无论成功或失败，都返回完整的响应结构
        // 业务错误 - 返回完整数据，让调用方处理不同错误码
        if (data.code !== SUCCESS_CODE && showError) {
          const customHandler = onError || this.errorHandler;
          // 构建错误对象，包含完整的错误信息
          const errorObj = {
            message: data.message || '请求失败',
            code: data.code,
            data: data,
          };
          customHandler(errorObj);
        }
        
        return data;
      } catch (error) {
        // 处理中止错误
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        // 显示错误提示
        if (showError && error instanceof Error) {
          const customHandler = onError || this.errorHandler;
          // 构建错误对象，包含完整的错误信息
          const errorObj = {
            message: error.message,
            code: error.name,
            data: error,
          };
          customHandler(errorObj);
        }

        throw error;
      } finally {
        // 从管理器中移除
        RequestManager.remove(requestId);
      }
    });
  
    return {
    requestId,
    promise: dataPromise() as Promise<ApiResponse<T>>,
    abort,
  };
  }

  /**
   * GET 请求
   */
  get<T = unknown>(url: string, options?: FetchOptions): RequestResult<T> {
    return this.request<T>(url, { ...options, method: 'get' });
  }

  /**
   * POST 请求
   */
  post<T = unknown>(url: string, options?: FetchOptions): RequestResult<T> {
    return this.request<T>(url, { ...options, method: 'post' });
  }

  /**
   * PUT 请求
   */
  put<T = unknown>(url: string, options?: FetchOptions): RequestResult<T> {
    return this.request<T>(url, { ...options, method: 'put' });
  }

  /**
   * PATCH 请求
   */
  patch<T = unknown>(url: string, options?: FetchOptions): RequestResult<T> {
    return this.request<T>(url, { ...options, method: 'patch' });
  }

  /**
   * DELETE 请求
   */
  delete<T = unknown>(url: string, options?: FetchOptions): RequestResult<T> {
    return this.request<T>(url, { ...options, method: 'delete' });
  }

  /**
   * 下载文件（返回 Blob，支持进度）
   */
  download(
    url: string,
    options?: FetchOptions & { onDownloadProgress?: DownloadProgressCallback }
  ): DownloadResult {
    const { onDownloadProgress, ...restOptions } = options || {};

    // 如果没有进度回调，直接使用普通请求
    if (!onDownloadProgress) {
      const requestResult = this.request<Blob>(url, {
        ...restOptions,
        method: 'get',
        responseType: 'blob',
        headers: {
          ...restOptions?.headers,
          'Content-Type': ContentType.download,
        },
      });

      // 将 RequestResult<Blob> 转换为 DownloadResult
      // 直接返回 Blob 数据（download 方法返回的是原始数据，不是 ApiResponse 包装）
      const blobPromise = requestResult.promise.then((response) => {
        return response.data as Blob;
      });

      return {
        requestId: requestResult.requestId,
        promise: blobPromise,
        abort: requestResult.abort,
      };
    }

    // 使用原生 fetch 实现进度监听
    const controller = new AbortController();
    const requestId = generateRequestId();
    const { params, ...fetchOptions } = restOptions;
    
    const abort = () => controller.abort();
    
    // 添加到请求管理器
    RequestManager.add(requestId, abort);

    const dataPromise = (async () => {
      try {
        // 构建完整 URL
        let fullUrl = url;
        if (params) {
          const searchParams = new URLSearchParams(params as Record<string, string>);
          fullUrl = `${url}?${searchParams.toString()}`;
        }

        const token = getToken();
        const headers: Record<string, string> = {
          ...(fetchOptions.headers as Record<string, string>),
          'Content-Type': ContentType.download,
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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
          if (onDownloadProgress) {
            onDownloadProgress({
              loaded,
              total: contentLength,
              percentage: contentLength ? Math.round((loaded / contentLength) * 100) : 0,
            });
          }
        }

        // 合并所有 chunks
        return new Blob(chunks as BlobPart[]);
      } catch (error) {
        if (restOptions.showError && error instanceof Error) {
          const customHandler = restOptions.onError || this.errorHandler;
          // 构建错误对象，包含完整的错误信息
          const errorObj = {
            message: error.message,
            code: error.name,
            data: error,
          };
          customHandler(errorObj);
        }
        throw error;
      } finally {
        // 从管理器中移除
        RequestManager.remove(requestId);
      }
    })();

    return {
      requestId,
      promise: dataPromise as Promise<Blob>,
      abort,
    };
  }

  /**
   * 上传文件（支持进度）
   */
  upload<T = unknown>(
    url: string,
    options: FetchOptions & {
      file?: File | Blob;
      fileFieldName?: string; // 文件字段名，默认 'file'
      data?: Record<string, unknown>;
      onUploadProgress?: UploadProgressCallback;
    }
  ): RequestResult<T> {
    const { file, fileFieldName = 'file', data, onUploadProgress, ...restOptions } = options;

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

    // 使用 XMLHttpRequest 实现进度监听
    const { showError = true, onError } = restOptions;
    let xhrInstance: XMLHttpRequest | null = null;
    const controller = new AbortController();
    const requestId = generateRequestId();
    
    const abort = () => xhrInstance?.abort();
    
    // 添加到请求管理器
    RequestManager.add(requestId, abort);

    const dataPromise = new Promise<T | ApiResponse<T>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrInstance = xhr;
      
      // 监听 AbortController
      controller.signal.addEventListener('abort', () => {
        xhr.abort();
      });

      // 进度监听
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onUploadProgress) {
          onUploadProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      // 完成监听
      xhr.addEventListener('load', () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText) as ApiResponse<T>;
            
            // 无论成功还是失败，都返回完整的响应结构
            if (data.code !== SUCCESS_CODE && showError) {
              const customHandler = onError || this.errorHandler;
              // 构建错误对象，包含完整的错误信息
              const errorObj = {
                message: data.message || '请求失败',
                code: data.code,
                data: data,
              };
              customHandler(errorObj);
            }
            resolve(data); // 返回完整数据，让调用方处理不同错误码
          } else {
            const errorObj = {
              message: `HTTP error! status: ${xhr.status}`,
              code: xhr.status.toString(),
              data: null,
            };
            if (showError) {
              const customHandler = onError || this.errorHandler;
              customHandler(errorObj);
            }
            reject(new Error(errorObj.message));
          }
        } catch (error) {
          reject(error);
        } finally {
          // 从管理器中移除
          RequestManager.remove(requestId);
        }
      });

      // 错误监听
      xhr.addEventListener('error', () => {
        const errorMessage = '上传失败';
        if (showError) {
          const customHandler = onError || this.errorHandler;
          customHandler(errorMessage);
        }
        reject(new Error(errorMessage));
        
        // 从管理器中移除
        RequestManager.remove(requestId);
      });

      // 中止监听
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
        
        // 从管理器中移除
        RequestManager.remove(requestId);
      });

      // 打开连接
      xhr.open('POST', url);

      // 设置请求头
      const token = getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // 自定义请求头
      if (restOptions.headers) {
        Object.entries(restOptions.headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, String(value));
          }
        });
      }

      // 发送请求
      xhr.send(formData);
    });

    return {
      requestId,
      promise: dataPromise as Promise<ApiResponse<T>>,
      abort,
    };
  }

  /**
   * SSE（Server-Sent Events）流式请求
   */
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
    const { params, rawResponse, responseType, showError, onUploadProgress, onDownloadProgress, ...kyOptions } = restOptions;

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

  /**
   * 批量取消请求
   */
  static abortByIds(ids: string[]): void {
    RequestManager.abortByIds(ids);
  }

  /**
   * 取消所有请求
   */
  static abortAll(): void {
    RequestManager.abortAll();
  }
}

/**
 * 创建 HTTP 客户端实例
 */
export function createHttpClient(options?: FetchOptions): HttpClient {
  return new HttpClient(options);
}

/**
 * 默认 HTTP 客户端实例
 */
export const httpClient = createHttpClient();
