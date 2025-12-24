# HTTP Client - 基于 Ky 的请求封装

> 🚀 现代化、类型安全的 HTTP 客户端，专为 React 应用设计

## ✨ 特性

- ✅ **规范化参数**：GET 使用 `params`，POST 使用 `body`
- ✅ **自动 Token 注入**：从 localStorage 自动获取并添加到请求头
- ✅ **智能错误提示**：默认集成 sonner toast，可自定义
- ✅ **智能请求中止**：所有请求返回独立的 `abort` 方法，无需管理 ID
- ✅ **ContentType 常量**：预定义常用 Content-Type
- ✅ **多种响应类型**：JSON / Blob / Text / ArrayBuffer
- ✅ **文件上传下载**：支持进度监听和中止控制
- ✅ **SSE 流式请求**：完整的 Server-Sent Events 支持（UTF-8 编码）
- ✅ **配置灵活覆盖**：基础配置 + 单次请求覆盖
- ✅ **TypeScript 完美支持**：完整的类型定义
- ✅ **多实例支持**：轻松管理多个 API 服务

## 📦 安装

```bash
pnpm add @rap/utils
```

确保项目中已安装 `sonner` 和 `ky`（已在 catalog 中配置）。

## 🚀 快速开始

### 1. 基础用法

```typescript
import { httpClient } from '@rap/utils/fetch';

// GET 请求（使用 params）
const request = httpClient.get('/api/users', {
  params: { page: 1, limit: 10 }
});

// 获取数据
const users = await request.data;

// 或者直接 await
const users2 = await httpClient.get('/api/users', {
  params: { page: 1, limit: 10 }
}).data;

// POST 请求（使用 body）
const result = await httpClient.post('/api/login', {
  body: {
    username: 'admin',
    password: '123456',
  },
}).data;
```

### 2. ContentType 常量

```typescript
import { httpClient, ContentType } from '@rap/utils/fetch';

// 使用预定义的 Content-Type
await httpClient.post('/api/form', {
  body: formData,
  headers: {
    'Content-Type': ContentType.form, // 'application/x-www-form-urlencoded;charset=UTF-8'
  },
});

// 可用的 ContentType:
// - ContentType.json
// - ContentType.form
// - ContentType.upload
// - ContentType.download
// - ContentType.downloadZip
// - ContentType.stream
```

### 3. 文件上传（带进度）

```typescript
import { httpClient } from '@rap/utils/fetch';

const file = document.querySelector('input[type="file"]').files[0];

const uploadRequest = httpClient.upload('/api/upload', {
  file,
  fileFieldName: 'avatar', // 自定义字段名，默认 'file'
  data: {
    name: '文件名称',
    category: 'document',
  },
  onUploadProgress: (progress) => {
    console.log(`上传进度: ${progress.percentage}%`);
  },
});

// 可以随时中止
uploadRequest.abort();

// 获取结果
const result = await uploadRequest.data;
```

### 4. 文件下载（带进度）

```ts
// 下载文件（带进度）
const downloadRequest = httpClient.download('/api/file/download', {
  onDownloadProgress: (progress) => {
    console.log(`下载进度: ${progress.percentage}%`);
  },
});

// 可以随时中止
downloadRequest.abort();

// 获取 Blob
const blob = await downloadRequest.data;

// 触发浏览器下载
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'filename.pdf';
a.click();
URL.revokeObjectURL(url);

// 或者使用 responseType（无进度）
const blob2 = await httpClient.get('/api/export', {
  responseType: 'blob',
}).data as Blob;
```

### 5. 请求中止（新 API）

所有请求方法都返回包含 `id`、`data` 和 `abort` 的对象：

```typescript
// 场景 1: 单个请求中止
const request = httpClient.get('/api/long-task');
console.log(request.id); // 'req_1234567890_abc123'

// 用户取消操作
cancelButton.onclick = () => {
  request.abort(); // 直接中止
};

try {
  const data = await request.data;
  console.log(data);
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    console.log('请求已中止');
  }
}

// 场景 2: 多次调用同一接口，独立控制
const search1 = httpClient.get('/api/search', { params: { q: 'react' } });
const search2 = httpClient.get('/api/search', { params: { q: 'vue' } });
const search3 = httpClient.get('/api/search', { params: { q: 'angular' } });

// 只中止第二个请求
search2.abort();

// 获取其他请求结果
const [result1, result3] = await Promise.all([
  search1.data,
  search3.data
]);

// 场景 3: 批量取消（使用 ID 数组）
const req1 = httpClient.get('/api/users');
const req2 = httpClient.get('/api/orders');
const req3 = httpClient.get('/api/products');

// 保存 ID
const ids = [req1.id, req2.id];

// 批量取消多个请求
httpClient.abort(ids); // 取消 req1 和 req2

// 或者取消单个
httpClient.abort(req3.id); // 只取消 req3

// 场景 4: 搜索防抖（取消上一次搜索）
let currentSearch: ReturnType<typeof httpClient.get> | null = null;

function handleSearch(keyword: string) {
  // 取消上一次搜索
  currentSearch?.abort();
  
  // 发起新搜索
  currentSearch = httpClient.get('/api/search', {
    params: { q: keyword }
  });
  
  return currentSearch.data;
}

// 场景 5: 组件卸载时中止请求
import { useEffect } from 'react';

function UserList() {
  useEffect(() => {
    const request = httpClient.get('/api/users');
    
    request.data.then(users => {
      console.log(users);
    });
    
    // 组件卸载时自动中止
    return () => request.abort();
  }, []);
}

// 场景 6: 按分组批量取消
// 一个功能模块包含多个请求
const req1 = httpClient.get('/api/users', { groupId: 'user-module' });
const req2 = httpClient.get('/api/roles', { groupId: 'user-module' });
const req3 = httpClient.get('/api/permissions', { groupId: 'user-module' });

// 批量取消整个模块的请求
httpClient.abortGroup('user-module');

// 场景 7: 全局取消所有请求
// 用户退出登录时取消所有请求
function logout() {
  httpClient.abortAll();
  // ... 其他退出逻辑
}

// 场景 8: 嵌套功能的请求管理
// 主功能包含多个子功能，每个子功能有多个请求
const mainGroupId = 'dashboard';

// 子功能1
const statsReq1 = httpClient.get('/api/stats/users', { groupId: mainGroupId });
const statsReq2 = httpClient.get('/api/stats/orders', { groupId: mainGroupId });

// 子功能2
const chartReq1 = httpClient.get('/api/charts/sales', { groupId: mainGroupId });
const chartReq2 = httpClient.get('/api/charts/traffic', { groupId: mainGroupId });

// 取消整个主功能的所有请求
httpClient.abortGroup(mainGroupId);

// 查看当前所有分组信息
const groups = httpClient.getGroupInfo();
console.log(groups); // [{ groupId: 'user-module', count: 3 }, ...]

// 查看所有请求 ID
const allIds = httpClient.getAllRequestIds();
console.log(allIds); // ['req_1234...', 'req_5678...', ...]
```

### 6. SSE 流式请求

```ts
const sseRequest = httpClient.sse('/api/chat/stream', {
  body: {
    message: 'Hello AI',
  },
  onMessage: (data) => {
    console.log('收到消息:', data);
  },
  onError: (error) => {
    console.error('SSE 错误:', error);
  },
  onEnd: () => {
    console.log('SSE 结束');
  },
});

// 用户不想继续接收消息时中止
stopButton.onclick = () => {
  sseRequest.abort();
};
```

### 7. 配置覆盖

创建客户端时设置基础配置，单次请求时可以覆盖：

```ts
import { createHttpClient } from '@rap/utils/fetch';

// 创建带基础配置的客户端
const apiClient = createHttpClient({
  prefixUrl: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'X-App-Version': '1.0',
  },
  showError: true,
  responseType: 'json',
});

// 单次请求覆盖配置
const request = apiClient.post('/upload', {
  timeout: 30000,              // 覆盖超时时间
  headers: {                   // 覆盖请求头
    'X-Custom': 'value'
  },
  responseType: 'blob',        // 覆盖响应类型
  showError: false,            // 覆盖错误提示
});
```

### 8. 错误处理

```ts
// 默认会显示 toast 错误提示（集成 sonner）
const data = await httpClient.get('/api/data').data;

// 不显示错误提示
const data2 = await httpClient.get('/api/data', {
  showError: false,
}).data;

// 自定义错误处理
await httpClient.get('/api/data', {
  onError: (message) => {
    alert(`错误: ${message}`);
  },
}).data;
```

## 🎯 完整示例

### 示例 1: 批量请求管理

```typescript
function DashboardPage() {
  useEffect(() => {
    const groupId = 'dashboard-data';
    const requestIds: string[] = [];
    
    const loadData = async () => {
      // 发起多个请求
      const req1 = httpClient.get('/api/users', { groupId });
      const req2 = httpClient.get('/api/orders', { groupId });
      const req3 = httpClient.get('/api/stats', { groupId });
      const req4 = httpClient.get('/api/charts', { groupId });
      
      // 保存 ID 以便后续使用
      requestIds.push(req1.id, req2.id, req3.id, req4.id);
      
      // 等待所有请求完成
      const [users, orders, stats, charts] = await Promise.all([
        req1.data,
        req2.data,
        req3.data,
        req4.data,
      ]);
      
      setData({ users, orders, stats, charts });
    };
    
    loadData();
    
    // 组件卸载时取消整个组的请求
    return () => {
      // 方式1: 按组取消
      httpClient.abortGroup(groupId);
      
      // 方式2: 按 ID 批量取消
      // httpClient.abort(requestIds);
    };
  }, []);
}
```

### 示例 2: 用户退出登录

```typescript
function useLogout() {
  const navigate = useNavigate();
  
  const logout = async () => {
    try {
      // 1. 取消所有请求
      httpClient.abortAll();
      
      // 2. 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 3. 调用退出接口
      await httpClient.post('/api/logout').data;
      
      // 4. 跳转到登录页
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return { logout };
}
```

### 示例 3: 多个请求部分取消

```typescript
function SearchPage() {
  const [results, setResults] = useState([]);
  
  const handleMultiSearch = async () => {
    // 同时搜索多个来源
    const googleReq = httpClient.get('/api/search/google', { params: { q: 'react' } });
    const bingReq = httpClient.get('/api/search/bing', { params: { q: 'react' } });
    const yahooReq = httpClient.get('/api/search/yahoo', { params: { q: 'react' } });
    
    // 等待 2 秒，如果 Yahoo 太慢就放弃
    setTimeout(() => {
      yahooReq.abort();
    }, 2000);
    
    // 或者只取消部分请求
    const slowRequests = [bingReq.id, yahooReq.id];
    httpClient.abort(slowRequests); // 只取消这两个
    
    // 获取结果
    try {
      const googleResults = await googleReq.data;
      setResults(googleResults);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <button onClick={handleMultiSearch}>搜索</button>
  );
}
```

### 上传文件并支持取消

```ts
import { useState } from 'react';
import { httpClient } from '@rap/utils/fetch';
import { toast } from 'sonner';

function FileUploader() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadRequest, setUploadRequest] = useState<ReturnType<typeof httpClient.upload> | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const request = httpClient.upload('/api/upload', {
      file,
      data: { filename: file.name },
      onUploadProgress: (prog) => {
        setProgress(prog.percentage);
      },
    });
    
    setUploadRequest(request);

    try {
      const result = await request.data;
      toast.success('上传成功');
      console.log(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info('上传已取消');
      }
    } finally {
      setUploading(false);
      setUploadRequest(null);
    }
  };

  const handleCancel = () => {
    uploadRequest?.abort();
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      
      {uploading && (
        <div>
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }} />
          </div>
          <p>上传进度: {progress}%</p>
          <button onClick={handleCancel}>取消上传</button>
        </div>
      )}
    </div>
  );
}
```

### React 组件中使用

```ts
import { useState, useEffect } from 'react';
import { httpClient } from '@rap/utils/fetch';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const request = httpClient.get<User[]>('/api/users');
      
      try {
        const data = await request.data;
        setUsers(data as User[]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const createUser = async (user: Omit<User, 'id'>) => {
    const request = httpClient.post<User>('/api/users', {
      body: user,
    });
    
    const newUser = await request.data;
    setUsers([...users, newUser as User]);
    toast.success('用户创建成功');
  };
  
  return (
    <div>
      {loading ? 'Loading...' : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name} - {user.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### SSE 聊天示例

```ts
import { useState, useRef } from 'react';
import { httpClient } from '@rap/utils/fetch';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const sseRequestRef = useRef<ReturnType<typeof httpClient.sse> | null>(null);
  
  const handleSend = () => {
    setResponse('');
    
    sseRequestRef.current = httpClient.sse('/api/chat/stream', {
      body: { message },
      onMessage: (data) => {
        setResponse((prev) => prev + data);
      },
      onError: (error) => {
        console.error('Chat error:', error);
      },
      onEnd: () => {
        console.log('Chat completed');
      },
    });
  };
  
  const handleStop = () => {
    sseRequestRef.current?.abort();
  };
  
  return (
    <div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSend}>发送</button>
      <button onClick={handleStop}>停止</button>
      <div>{response}</div>
    </div>
  );
}
```

### 搜索防抖示例

```ts
import { useState, useRef, useEffect } from 'react';
import { httpClient } from '@rap/utils/fetch';

function SearchComponent() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const currentRequestRef = useRef<ReturnType<typeof httpClient.get> | null>(null);
  
  useEffect(() => {
    if (!keyword) {
      setResults([]);
      return;
    }
    
    // 取消上一次搜索
    currentRequestRef.current?.abort();
    
    // 延迟搜索
    const timer = setTimeout(() => {
      const request = httpClient.get('/api/search', {
        params: { q: keyword }
      });
      
      currentRequestRef.current = request;
      
      request.data.then(data => {
        setResults(data as []);
      }).catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Search failed:', error);
        }
      });
    }, 300);
    
    return () => {
      clearTimeout(timer);
      currentRequestRef.current?.abort();
    };
  }, [keyword]);
  
  return (
    <div>
      <input 
        value={keyword} 
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索..."
      />
      <ul>
        {results.map((item: any) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 📖 API 文档

### RequestResult 类型

所有请求方法都返回 `RequestResult` 类型：

```typescript
interface RequestResult<T> {
  id: string;           // 请求唯一 ID
  data: Promise<T>;     // 请求 Promise
  abort: () => void;    // 中止当前请求的函数
}
```

### HttpClient 方法

class HttpClient {
  // GET 请求
  get<T>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response>;
  
  // POST 请求
  post<T>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response>;
  
  // PUT 请求
  put<T>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response>;
  
  // PATCH 请求
  patch<T>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response>;
  
  // DELETE 请求
  delete<T>(url: string, options?: FetchOptions): RequestResult<T | ApiResponse<T> | Response>;
  
  // 上传文件（带进度）
  upload<T>(url: string, options: {
    file?: File | Blob;
    fileFieldName?: string; // 文件字段名，默认 'file'
    data?: Record<string, unknown>;
    onUploadProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  }): RequestResult<T | ApiResponse<T>>;
  
  // 下载文件（带进度）
  download(url: string, options?: {
    onDownloadProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  }): RequestResult<Blob>;
  
  // SSE 流式请求
  sse(url: string, options: SSEOptions): { abort: () => void };
  
  // 按 ID 批量取消请求（支持单个或数组）
  abort(ids: string | string[]): void;
  
  // 取消指定分组的所有请求
  abortGroup(groupId: string): void;
  
  // 取消所有请求
  abortAll(): void;
  
  // 获取当前所有分组的信息
  getGroupInfo(): { groupId: string; count: number }[];
  
  // 获取所有请求 ID
  getAllRequestIds(): string[];
}
```

### FetchOptions 配置

```ts
interface FetchOptions {
  // GET 请求参数
  params?: Record<string, unknown>;
  
  // POST/PUT/PATCH 请求体
  body?: unknown;
  
  // 是否返回原始 Response 对象
  rawResponse?: boolean; // 默认: false
  
  // 响应类型
  responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer' | 'formData'; // 默认: 'json'
  
  // 是否显示错误提示
  showError?: boolean; // 默认: true
  
  // 请求分组 ID（用于批量取消）
  groupId?: string;
  
  // 上传进度回调（upload 方法）
  onUploadProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  
  // 下载进度回调（download 方法）
  onDownloadProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
  
  // 自定义错误处理函数
  onError?: (message: string) => void;
  
  // ... 所有 ky 的配置选项（timeout, headers, retry 等）
}
```

## 🔧 配置

### 设置全局错误处理

```ts
import { setGlobalErrorHandler } from '@rap/utils/fetch';

setGlobalErrorHandler((message) => {
  // 自定义全局错误处理
  notification.error({ message });
});
```

### 创建自定义实例

```ts
import { createHttpClient } from '@rap/utils/fetch';

const apiClient = createHttpClient({
  prefixUrl: 'https://api.example.com',
  timeout: 30000,
  headers: {
    'X-Custom-Header': 'value',
  },
});
```

### 批量请求管理示例

```typescript
import { useState, useEffect } from 'react';
import { httpClient } from '@rap/utils/fetch';

function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    const groupId = 'dashboard-data';
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        // 同一个页面的多个请求使用相同的 groupId
        const [users, orders, stats, charts] = await Promise.all([
          httpClient.get('/api/users', { groupId }).data,
          httpClient.get('/api/orders', { groupId }).data,
          httpClient.get('/api/stats', { groupId }).data,
          httpClient.get('/api/charts', { groupId }).data,
        ]);
        
        setData({ users, orders, stats, charts });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Load data failed:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // 组件卸载时取消整个组的请求
    return () => {
      httpClient.abortGroup(groupId);
    };
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Dashboard</h1>
      {/* 渲染数据 */}
    </div>
  );
}
```

### 用户退出示例

```typescript
import { httpClient } from '@rap/utils/fetch';
import { useNavigate } from 'react-router-dom';

function useLogout() {
  const navigate = useNavigate();
  
  const logout = async () => {
    // 1. 取消所有请求
    httpClient.abortAll();
    
    // 2. 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 3. 调用退出接口（可选）
    try {
      await httpClient.post('/api/logout').data;
    } catch (error) {
      // 忽略错误
    }
    
    // 4. 跳转到登录页
    navigate('/login');
  };
  
  return { logout };
}
```

## 📚 更多示例

查看以下文档获取更多完整示例：

- [FETCH_EXAMPLES.md](./FETCH_EXAMPLES.md) - 完整的 HTTP 请求示例
- [UPLOAD_DOWNLOAD_EXAMPLE.md](./UPLOAD_DOWNLOAD_EXAMPLE.md) - 文件上传下载示例（带进度）

## ⚠️ 注意事项

1. **错误处理**：默认使用 sonner toast 显示错误，需要在应用中引入 `<Toaster />` 组件
2. **请求参数**：GET 请求使用 `params`，POST/PUT/PATCH 使用 `body`，符合 RESTful 规范
3. **请求中止**：所有请求返回 `{ id, data, abort }` 对象，直接调用 `abort()` 即可中止，无需管理 ID
4. **批量取消**：
   - 使用 `httpClient.abort(ids)` 按 ID 批量取消，支持单个或数组
   - 使用 `groupId` 将多个请求分组，通过 `abortGroup(groupId)` 批量取消
5. **全局取消**：调用 `abortAll()` 取消所有请求（如用户退出登录）
6. **文件上传**：`upload` 方法默认使用 `multipart/form-data`，支持进度监听（使用 XMLHttpRequest），文件字段名默认为 `file`，可通过 `fileFieldName` 自定义
7. **文件下载**：`download` 方法返回 Blob，支持进度监听（使用原生 Fetch + Stream）
8. **进度支持**：由于 Ky 和 Fetch API 不原生支持进度事件，上传使用 XMLHttpRequest，下载使用 ReadableStream
9. **SSE 编码**：SSE 流式请求默认使用 UTF-8 编码
10. **配置覆盖**：单次请求可以覆盖基础配置（headers, timeout, responseType 等）
11. **TypeScript**：建议为所有请求指定泛型类型以获得更好的类型提示

## 📄 License

MIT
