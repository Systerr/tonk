// Browser entry point - no polyfills needed
// Export the engine
export * from './engine/index.js';

// Export the middleware
export * from './middleware/index.js';

// Export the core functionality
export * from './core/index.js';

// Import WASM for automerge
import wasmUrl from '@automerge/automerge/automerge.wasm';
import {next as Automerge} from '@automerge/automerge/slim';

// Initialize WASM
await Automerge.initializeWasm(wasmUrl);

// Re-export specific functions for easier access
export {
  configureSyncEngine,
  getSyncEngine,
  closeSyncEngine,
} from './core/syncConfig.js';
