// Type declarations for Vite HMR API (only available in dev mode)
interface ViteHotContext {
  on(event: string, cb: (...args: any[]) => void): void;
  off(event: string, cb: (...args: any[]) => void): void;
}

interface ImportMeta {
  hot?: ViteHotContext;
}
