import * as React from "react";
import { useCallback, useRef, useState } from "react";
// @ts-ignore spark-md5 does not ship first-party TypeScript declarations.
import SparkMD5 from "spark-md5";
import { Upload, FolderUp, X } from "lucide-react";
import { ProButton } from "../button";
import { cn } from "@rap/utils";

export type UploadTaskStatus =
  | "pending"
  | "hashing"
  | "checking"
  | "uploading"
  | "paused"
  | "merging"
  | "success"
  | "error"
  | "canceled";

export interface UploadChunkInfo {
  index: number;
  start: number;
  end: number;
  blob: Blob;
}

export interface UploadTask {
  id: string;
  file: File;
  status: UploadTaskStatus;
  hash?: string;
  uploadId?: string;
  error?: unknown;
  hashProgress: number;
  uploadProgress: number;
  mergeProgress: number;
  totalProgress: number;
}

export interface UseChunkUploadOptions {
  chunkSize?: number;
  minChunkSize?: number;
  concurrency?: number;
  retryCount?: number;
  hash?: {
    enabled?: boolean;
    worker?: boolean;
    chunkSize?: number;
  };
  checkFile?: (ctx: { file: File; hash?: string }) => Promise<{
    uploaded?: boolean;
    uploadedChunks?: number[];
    uploadId?: string;
    url?: string;
  } | void>;
  uploadChunk?: (ctx: {
    file: File;
    hash?: string;
    uploadId?: string;
    chunk: UploadChunkInfo;
    signal: AbortSignal;
  }) => Promise<unknown>;
  mergeChunks?: (ctx: {
    file: File;
    hash?: string;
    uploadId?: string;
    chunks: UploadChunkInfo[];
  }) => Promise<unknown>;
  uploadFile?: (ctx: { file: File; hash?: string; signal: AbortSignal }) => Promise<unknown>;
  onTaskChange?: (task: UploadTask) => void;
}

function createChunks(file: File, chunkSize: number) {
  const chunks: UploadChunkInfo[] = [];
  let index = 0;
  for (let start = 0; start < file.size; start += chunkSize) {
    const end = Math.min(start + chunkSize, file.size);
    chunks.push({ index, start, end, blob: file.slice(start, end) });
    index += 1;
  }
  return chunks;
}

function calcTotalProgress(task: UploadTask) {
  return Math.round(
    task.hashProgress * 0.1 + task.uploadProgress * 0.85 + task.mergeProgress * 0.05
  );
}

async function calculateMd5Main(
  file: File,
  chunkSize: number,
  onProgress: (progress: number) => void
) {
  const chunks = createChunks(file, chunkSize);
  const spark = new SparkMD5.ArrayBuffer();
  for (let index = 0; index < chunks.length; index++) {
    spark.append(await chunks[index].blob.arrayBuffer());
    onProgress(Math.round(((index + 1) / chunks.length) * 100));
  }
  return spark.end();
}

function calculateMd5Worker(file: File, chunkSize: number, onProgress: (progress: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const worker = new Worker(new URL("./md5-worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (
      event: MessageEvent<{ type: string; progress?: number; hash?: string; error?: string }>
    ) => {
      if (event.data.type === "progress") onProgress(event.data.progress ?? 0);
      if (event.data.type === "done" && event.data.hash) {
        worker.terminate();
        resolve(event.data.hash);
      }
      if (event.data.type === "error") {
        worker.terminate();
        reject(new Error(event.data.error));
      }
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(event.error ?? new Error(event.message));
    };
    worker.postMessage({ file, chunkSize });
  });
}

export function useChunkUpload({
  chunkSize = 5 * 1024 * 1024,
  minChunkSize = 2 * 1024 * 1024,
  concurrency = 4,
  retryCount = 2,
  hash = { enabled: true, worker: true },
  checkFile,
  uploadChunk,
  mergeChunks,
  uploadFile,
  onTaskChange,
}: UseChunkUploadOptions = {}) {
  const [tasks, setTasks] = React.useState<UploadTask[]>([]);
  const controllersRef = React.useRef(new Map<string, AbortController>());

  const updateTask = React.useCallback(
    (id: string, patch: Partial<UploadTask>) => {
      setTasks((current) =>
        current.map((task) => {
          if (task.id !== id) return task;
          const next = { ...task, ...patch };
          next.totalProgress = calcTotalProgress(next);
          onTaskChange?.(next);
          return next;
        })
      );
    },
    [onTaskChange]
  );

  const runTask = React.useCallback(
    async (task: UploadTask) => {
      const controller = new AbortController();
      controllersRef.current.set(task.id, controller);
      try {
        let fileHash: string | undefined;
        if (hash.enabled !== false) {
          updateTask(task.id, { status: "hashing", hashProgress: 0 });
          try {
            fileHash =
              hash.worker === false
                ? await calculateMd5Main(task.file, hash.chunkSize ?? chunkSize, (progress) =>
                    updateTask(task.id, { hashProgress: progress })
                  )
                : await calculateMd5Worker(task.file, hash.chunkSize ?? chunkSize, (progress) =>
                    updateTask(task.id, { hashProgress: progress })
                  );
          } catch {
            fileHash = await calculateMd5Main(task.file, hash.chunkSize ?? chunkSize, (progress) =>
              updateTask(task.id, { hashProgress: progress })
            );
          }
          updateTask(task.id, { hash: fileHash, hashProgress: 100 });
        }

        updateTask(task.id, { status: "checking" });
        const check = await checkFile?.({ file: task.file, hash: fileHash });
        if (check?.uploaded) {
          updateTask(task.id, { status: "success", uploadProgress: 100, mergeProgress: 100 });
          return;
        }

        if (task.file.size < minChunkSize || !uploadChunk) {
          updateTask(task.id, { status: "uploading" });
          await uploadFile?.({ file: task.file, hash: fileHash, signal: controller.signal });
          updateTask(task.id, { status: "success", uploadProgress: 100, mergeProgress: 100 });
          return;
        }

        const chunks = createChunks(task.file, chunkSize);
        const uploaded = new Set(check?.uploadedChunks ?? []);
        let completed = uploaded.size;
        let cursor = 0;
        updateTask(task.id, {
          status: "uploading",
          uploadId: check?.uploadId,
          uploadProgress: Math.round((completed / chunks.length) * 100),
        });

        const worker = async () => {
          while (cursor < chunks.length) {
            const chunk = chunks[cursor++];
            if (uploaded.has(chunk.index)) continue;
            let attempt = 0;
            while (attempt <= retryCount) {
              try {
                await uploadChunk({
                  file: task.file,
                  hash: fileHash,
                  uploadId: check?.uploadId,
                  chunk,
                  signal: controller.signal,
                });
                break;
              } catch (error) {
                attempt += 1;
                if (attempt > retryCount) throw error;
              }
            }
            completed += 1;
            updateTask(task.id, { uploadProgress: Math.round((completed / chunks.length) * 100) });
          }
        };

        await Promise.all(Array.from({ length: Math.min(concurrency, chunks.length) }, worker));
        updateTask(task.id, { status: "merging", mergeProgress: 20 });
        await mergeChunks?.({ file: task.file, hash: fileHash, uploadId: check?.uploadId, chunks });
        updateTask(task.id, { status: "success", uploadProgress: 100, mergeProgress: 100 });
      } catch (error) {
        if (controller.signal.aborted) updateTask(task.id, { status: "canceled", error });
        else updateTask(task.id, { status: "error", error });
      } finally {
        controllersRef.current.delete(task.id);
      }
    },
    [
      checkFile,
      chunkSize,
      concurrency,
      hash.chunkSize,
      hash.enabled,
      hash.worker,
      mergeChunks,
      minChunkSize,
      retryCount,
      updateTask,
      uploadChunk,
      uploadFile,
    ]
  );

  const start = React.useCallback(
    (files: File[] | FileList) => {
      const nextTasks = Array.from(files).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "pending" as UploadTaskStatus,
        hashProgress: 0,
        uploadProgress: 0,
        mergeProgress: 0,
        totalProgress: 0,
      }));
      setTasks((current) => [...current, ...nextTasks]);
      for (const task of nextTasks) void runTask(task);
    },
    [runTask]
  );

  const cancel = React.useCallback(
    (id: string) => {
      controllersRef.current.get(id)?.abort();
      updateTask(id, { status: "canceled" });
    },
    [updateTask]
  );

  const clear = React.useCallback(() => setTasks([]), []);

  return { tasks, start, cancel, clear };
}

export interface ChunkUploadProps extends UseChunkUploadOptions {
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
  className?: string;
}

export function ChunkUpload({
  accept,
  multiple = true,
  directory,
  className,
  ...options
}: ChunkUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const upload = useChunkUpload(options);
  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center">
        <Upload className="mx-auto size-8 text-muted-foreground" />
        <div className="mt-3 font-medium text-sm">选择文件或拖拽上传</div>
        <div className="mt-1 text-muted-foreground text-xs">
          支持 MD5 Worker、分片上传、断点续传和失败重试
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          {...(directory ? { webkitdirectory: "", directory: "" } : {})}
          onChange={(event) => event.target.files && upload.start(event.target.files)}
        />
        <ProButton
          className="mt-4"
          icon={directory ? <FolderUp className="size-4" /> : <Upload className="size-4" />}
          onClick={() => inputRef.current?.click()}
        >
          {directory ? "选择目录" : "选择文件"}
        </ProButton>
      </div>
      <div className="space-y-2">
        {upload.tasks.map((task) => (
          <div key={task.id} className="rounded-md border bg-background p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-medium text-sm">{task.file.name}</div>
                <div className="text-muted-foreground text-xs">{task.status}</div>
              </div>
              <ProButton size="icon-sm" variant="ghost" onClick={() => upload.cancel(task.id)}>
                <X className="size-4" />
              </ProButton>
            </div>
            <Progress label="MD5" value={task.hashProgress} />
            <Progress label="上传" value={task.uploadProgress} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-2 grid grid-cols-[3rem_1fr_3rem] items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
      <span className="text-right text-muted-foreground">{value}%</span>
    </div>
  );
}

export function DirectoryUpload(props: Omit<ChunkUploadProps, "directory">) {
  return <ChunkUpload {...props} directory />;
}
