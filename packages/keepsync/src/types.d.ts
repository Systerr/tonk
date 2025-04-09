// Type definitions for global sync engine registry
interface SyncEngineRegistry {
  callbacks: Array<(syncEngine: any) => void>;
  notifyCallbacks: () => void;
}

declare global {
  interface Window {
    __SYNC_ENGINE_REGISTRY__?: SyncEngineRegistry;
  }
}

declare module '@automerge/automerge/automerge.wasm' {
  const wasmUrl: string;
  export default wasmUrl;
}

declare module '@automerge/automerge/slim' {
  export const next: any;
}

export {};
