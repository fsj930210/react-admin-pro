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
export type ErrorHandler = (message: string) => void;

/**
 * 请求结果包装类型
 */
export interface RequestResult<T> {
  /**
   * 请求唯一 ID
   */
  id: string;
  
  /**
   * 请求 Promise
   */
  data: Promise<T>;
  
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
   * 请求分组 ID（用于批量取消）
   */
  groupId?: string;
  
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
 * 请求分组管理器
 */
class RequestGroupManager {
  private groups = new Map<string, Set<AbortController>>();
  private requests = new Map<string, AbortController>(); // ID -> Controller
  
  /**
   * 添加请求
   */
  addRequest(id: string, controller: AbortController, groupId?: string): void {
    // 按 ID 存储
    this.requests.set(id, controller);
    
    // 如果有 groupId，添加到分组
    if (groupId) {
      if (!this.groups.has(groupId)) {
        this.groups.set(groupId, new Set());
      }
      this.groups.get(groupId)!.add(controller);
    }
  }
  
  /**
   * 移除请求
   */
  removeRequest(id: string, groupId?: string): void {
    const controller = this.requests.get(id);
    if (controller) {
      this.requests.delete(id);
      
      // 从分组中移除
      if (groupId) {
        const group = this.groups.get(groupId);
        if (group) {
          group.delete(controller);
          if (group.size === 0) {
            this.groups.delete(groupId);
          }
        }
      }
    }
  }
  
  /**
   * 按 ID 取消请求（支持数组）
   */
  abortById(ids: string | string[]): void {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    idArray.forEach(id => {
      const controller = this.requests.get(id);
      if (controller) {
        controller.abort();
        this.requests.delete(id);
      }
    });
  }
  
  /**
   * 取消整个分组的请求
   */
  abortGroup(groupId: string): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.forEach(controller => controller.abort());
      this.groups.delete(groupId);
    }
  }
  
  /**
   * 取消所有请求
   */
  abortAll(): void {
    this.requests.forEach(controller => controller.abort());
    this.requests.clear();
    this.groups.clear();
  }
  
  /**
   * 获取分组信息
   */
  getGroupInfo(): { groupId: string; count: number }[] {
    return Array.from(this.groups.entries()).map(([groupId, group]) => ({
      groupId,
      count: group.size,
    }));
  }
  
  /**
   * 获取所有请求 ID
   */
  getAllRequestIds(): string[] {
    return Array.from(this.requests.keys());
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
let defaultErrorHandler: ErrorHandler = (message: string): void => {
  // 动态导入 sonner 以避免 SSR 问题
  if (typeof window !== 'undefined') {
		toast.error(message);
  } else {
    console.error(`[HttpClient Error]: ${message}`);
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
  private requestGroupManager: RequestGroupManager;

  constructor(options: FetchOptions = {}) {
    this.defaultOptions = {
      showError: true,
      rawResponse: false,
      responseType: 'json',
      ...options,
    };
    
    this.errorHandler = options.onError || defaultErrorHandler;
    this.requestGroupManager = new RequestGroupManager();

    // 提取自定义选项
    const { params, body, rawResponse, responseType, showError, onError, onUploadProgress, onDownloadProgress, ...kyOptions } = options;

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
  ): RequestResult<T | ApiResponse<T> | Response> {
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
      groupId,
      onError,
      onUploadProgress,
      onDownloadProgress,
      ...kyOptions
    } = mergedOptions;

    // 创建请求专用的中止控制器
    const controller = new AbortController();
    const requestId = generateRequestId();
    kyOptions.signal = controller.signal;
    
    // 添加到请求管理器
    this.requestGroupManager.addRequest(requestId, controller, groupId);

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

    const dataPromise = (async () => {
      try {
        const response = await this.client(url, kyOptions as KyOptions);

        // 返回原始 Response 对象
        if (rawResponse) {
          return response;
        }

        // 根据响应类型处理
        if (responseType === 'blob') {
          return (await response.blob()) as T;
        }

        if (responseType === 'text') {
          return (await response.text()) as T;
        }

        if (responseType === 'arrayBuffer') {
          return (await response.arrayBuffer()) as T;
        }

        if (responseType === 'formData') {
          return (await response.formData()) as T;
        }

        // 默认 JSON 处理
        const data = await response.json<ApiResponse<T>>();

        // 处理业务逻辑
        if (data.code === SUCCESS_CODE) {
          return data.data as T;
        }

        // 业务错误
        const errorMessage = data.message || '请求失败';
        if (showError) {
          const customHandler = onError || this.errorHandler;
          customHandler(errorMessage);
        }
        
        throw new Error(errorMessage);
      } catch (error) {
        // 处理中止错误
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        // 显示错误提示
        if (showError && error instanceof Error) {
          const customHandler = onError || this.errorHandler;
          customHandler(error.message);
        }

        throw error;
      } finally {
        // 从管理器中移除
        this.requestGroupManager.removeRequest(requestId, groupId);
      }
    })();

    return {
      id: requestId,
      data: dataPromise,
      abort: () => controller.abort(),
    };
  }

  /**
   * GET 请求
   */
  get<T = unknown>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response> {
    return this.request<T>(url, { ...options, method: 'get' });
  }

  /**
   * POST 请求
   */
  post<T = unknown>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response> {
    return this.request<T>(url, { ...options, method: 'post' });
  }

  /**
   * PUT 请求
   */
  put<T = unknown>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response> {
    return this.request<T>(url, { ...options, method: 'put' });
  }

  /**
   * PATCH 请求
   */
  patch<T = unknown>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response> {
    return this.request<T>(url, { ...options, method: 'patch' });
  }

  /**
   * DELETE 请求
   */
  delete<T = unknown>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response> {
    return this.request<T>(url, { ...options, method: 'delete' });
  }

  /**
   * 下载文件（返回 Blob，支持进度）
   */
  download(
    url: string,
    options?: FetchOptions & { onDownloadProgress?: DownloadProgressCallback }
  ): RequestResult<Blob> {
    const { onDownloadProgress, ...restOptions } = options || {};

    // 如果没有进度回调，直接使用普通请求
    if (!onDownloadProgress) {
      return this.request<Blob>(url, {
        ...restOptions,
        method: 'get',
        responseType: 'blob',
        headers: {
          ...restOptions?.headers,
          'Content-Type': ContentType.download,
        },
      }) as RequestResult<Blob>;
    }

    // 使用原生 fetch 实现进度监听
    const controller = new AbortController();
    const requestId = generateRequestId();
    const { params, groupId, ...fetchOptions } = restOptions;
    
    // 添加到请求管理器
    this.requestGroupManager.addRequest(requestId, controller, groupId);

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
        return new Blob(chunks);
      } catch (error) {
        if (restOptions.showError && error instanceof Error) {
          const customHandler = restOptions.onError || this.errorHandler;
          customHandler(error.message);
        }
        throw error;
      } finally {
        // 从管理器中移除
        this.requestGroupManager.removeRequest(requestId, groupId);
      }
    })();

    return {
      id: requestId,
      data: dataPromise,
      abort: () => controller.abort(),
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
  ): RequestResult<T | ApiResponse<T>> {
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
        headers: {
          ...restOptions?.headers,
          // FormData 会自动设置 Content-Type
        },
      }) as RequestResult<T | ApiResponse<T>>;
    }

    // 使用 XMLHttpRequest 实现进度监听
    const { showError = true, onError, groupId } = restOptions;
    let xhrInstance: XMLHttpRequest | null = null;
    const controller = new AbortController();
    const requestId = generateRequestId();
    
    // 添加到请求管理器
    this.requestGroupManager.addRequest(requestId, controller, groupId);

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
            
            // 处理业务逻辑
            if (data.code === SUCCESS_CODE) {
              resolve(data.data as T);
            } else {
              const errorMessage = data.message || '请求失败';
              if (showError) {
                const customHandler = onError || this.errorHandler;
                customHandler(errorMessage);
              }
              reject(new Error(errorMessage));
            }
          } else {
            const errorMessage = `HTTP error! status: ${xhr.status}`;
            if (showError) {
              const customHandler = onError || this.errorHandler;
              customHandler(errorMessage);
            }
            reject(new Error(errorMessage));
          }
        } catch (error) {
          reject(error);
        } finally {
          // 从管理器中移除
          this.requestGroupManager.removeRequest(requestId, groupId);
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
        this.requestGroupManager.removeRequest(requestId, groupId);
      });

      // 中止监听
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
        
        // 从管理器中移除
        this.requestGroupManager.removeRequest(requestId, groupId);
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
      id: requestId,
      data: dataPromise,
      abort: () => xhrInstance?.abort(),
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
   * 按 ID 批量取消请求（支持单个或数组）
   */
  abort(ids: string | string[]): void {
    this.requestGroupManager.abortById(ids);
  }

  /**
   * 取消指定分组的所有请求
   */
  abortGroup(groupId: string): void {
    this.requestGroupManager.abortGroup(groupId);
  }

  /**
   * 取消所有请求
   */
  abortAll(): void {
    this.requestGroupManager.abortAll();
  }

  /**
   * 获取当前所有分组的信息
   */
  getGroupInfo(): { groupId: string; count: number }[] {
    return this.requestGroupManager.getGroupInfo();
  }
  
  /**
   * 获取所有请求 ID
   */
  getAllRequestIds(): string[] {
    return this.requestGroupManager.getAllRequestIds();
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

/**
 * 便捷导出
 */
export const { get, post, put, patch, delete: del } = httpClient;
