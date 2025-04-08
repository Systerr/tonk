// Browser entry point - no polyfills needed
// Export the engine
export * from './engine/index.js';

// Export the middleware
export * from './middleware/index.js';

// Export the core functionality
export * from './core/index.js';

import * as Automerge from '@automerge/automerge';
import * as AutomergeWasm from '@automerge/automerge-wasm';

// Initialize Automerge with WASM
Automerge.use(AutomergeWasm);

// Re-export specific functions for easier access
export {
  configureSyncEngine,
  getSyncEngine,
  closeSyncEngine,
} from './core/syncConfig.js';
