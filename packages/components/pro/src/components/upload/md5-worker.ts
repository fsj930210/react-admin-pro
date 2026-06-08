// @ts-ignore spark-md5 does not ship first-party TypeScript declarations.
import SparkMD5 from "spark-md5";

interface HashMessage {
  file: File;
  chunkSize: number;
}

self.onmessage = async (event: MessageEvent<HashMessage>) => {
  const { file, chunkSize } = event.data;
  const chunks = Math.ceil(file.size / chunkSize);
  const spark = new SparkMD5.ArrayBuffer();
  const reader = new FileReader();
  let current = 0;

  const loadNext = () => {
    const start = current * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    reader.readAsArrayBuffer(file.slice(start, end));
  };

  reader.onload = (loadEvent) => {
    if (loadEvent.target?.result) {
      spark.append(loadEvent.target.result as ArrayBuffer);
    }
    current += 1;
    self.postMessage({ type: "progress", progress: Math.round((current / chunks) * 100) });
    if (current < chunks) {
      loadNext();
    } else {
      self.postMessage({ type: "done", hash: spark.end() });
    }
  };

  reader.onerror = () => {
    self.postMessage({ type: "error", error: reader.error?.message ?? "MD5 calculation failed" });
  };

  loadNext();
};
