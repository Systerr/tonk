import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {next as Automerge} from '@automerge/automerge/slim';
// Import polyfills for Node.js environment
import './polyfills.js';

// Initialize WASM for Node.js environment
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const wasmPath = path.resolve(__dirname, 'node_automerge_wasm_bg.wasm');

  if (fs.existsSync(wasmPath)) {
    const wasmBuffer = fs.readFileSync(wasmPath);
    Automerge.initializeWasm(wasmBuffer);
  } else {
    console.error(`WASM file not found at ${wasmPath}`);
  }
} catch (err) {
  console.error('Error initializing Automerge WASM:', err);
}

// Export the engine
export * from './engine/index.js';

// Export the middleware
export * from './middleware/index.js';

// Export the core functionality
export * from './core/index.js';

// Export the file system functionality
// export * from './fs/index.js';

// Re-export specific functions for easier access
export {
  configureSyncEngine,
  getSyncEngine,
  closeSyncEngine,
} from './core/syncConfig.js';

// Re-export file system functions for easier access
// export {
//   configureSyncedFileSystem,
//   getSyncedFileManager,
//   addFile,
//   removeFile,
//   getFile,
//   getAllFiles,
//   closeSyncedFileSystem,
// } from './core/syncedFiles.js';
