
import { setupWorker, type StartOptions } from 'msw/browser';

export interface MockConfig {
  enableMock: string;
  currentEnvironment: string;
  startOptions?: StartOptions;
}

export function shouldEnableMock(config: MockConfig): boolean {
  const { enableMock, currentEnvironment } = config

  if (enableMock === 'none') {
    return false
  }


  // 默认仅开发环境启用
  return currentEnvironment === 'development' && !enableMock
}


export async function initMock(
  handlers: any[],
  config: MockConfig,
) {
  if (shouldEnableMock(config)) {
    const worker = setupWorker(...handlers)
    await worker.start({ ...config.startOptions, onUnhandledRequest: 'bypass' })
    console.log('[MSW] Mock enabled for', config.currentEnvironment)
    return worker
  }
  return null
}

