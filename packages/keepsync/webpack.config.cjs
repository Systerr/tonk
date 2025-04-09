const path = require('path');
const fs = require('fs');

// Common configuration for both environments
const commonConfig = {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              moduleResolution: 'node',
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource'
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
      '.cjs': ['.cjs', '.cts'],
      '.mjs': ['.mjs', '.mts'],
    },
    fullySpecified: false,
  },
  externals: {
    'react': 'react',
    'zustand': 'zustand',
  },
  optimization: {
    minimize: false,
  },
  // Suppress warnings about optional dependencies
  ignoreWarnings: [
    {
      module: /node_modules\/ws\/lib\/(buffer-util|validation)\.js/,
      message: /Can't resolve '(bufferutil|utf-8-validate)'/
    }
  ],
};

// Browser-specific configuration
const browserConfig = {
  ...commonConfig,
  name: 'browser',
  entry: './src/browser.ts',
  resolve: {
    ...commonConfig.resolve,
    alias: {
      ...commonConfig.resolve.alias,
      // Ensure Node.js modules are not included
      'node-fetch': false,
      'ws': false,
      'fake-indexeddb': false,
      'buffer': false
    },
    fallback: {
      'buffer': false
    }
  },
  output: {
    filename: 'browser.js',
    path: path.resolve(__dirname, 'dist'),
    clean: false,
    library: {
      type: 'module',
    },
    module: true,
    environment: {
      module: true,
    },
  },
  experiments: {
    outputModule: true,
    asyncWebAssembly: true,
  },
  target: ['web', 'es2020'],
  plugins: [
    // Create index.js after build
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CreateIndexFile', (compilation) => {
          fs.writeFileSync(
            path.resolve(__dirname, 'dist/index.js'), 
            'export * from \'./browser.js\';\n'
          );
        });
      }
    }
  ]
};

// Node.js-specific configuration
const nodeConfig = {
  ...commonConfig,
  name: 'node',
  entry: './src/node.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/node'),
    clean: false,
    library: {
      type: 'module',
    },
    module: true,
    environment: {
      module: true,
    },
    assetModuleFilename: '[name][ext]',
  },
  experiments: {
    outputModule: true,
    asyncWebAssembly: true,
  },
  externals: {
    ...commonConfig.externals,
    // Only keep externals for dependencies that will be installed alongside the package
    // or are provided by the environment
  },
  target: ['node', 'es2020'],
  plugins: [
    // Copy the WASM file to the output directory
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CopyWasmFile', (compilation) => {
          try {
            // Try multiple possible locations for the WASM file
            const possibleWasmPaths = [
              // For pnpm
              path.resolve(__dirname, 'node_modules/.pnpm/@automerge+automerge@2.2.8/node_modules/@automerge/automerge/dist/mjs/wasm_bindgen_output/nodejs/automerge_wasm_bg.wasm'),
              // For direct npm/yarn
              path.resolve(__dirname, 'node_modules/@automerge/automerge/dist/automerge.wasm'),
              path.resolve(__dirname, 'node_modules/@automerge/automerge/automerge.wasm')
            ];
            
            let wasmPath = null;
            for (const possiblePath of possibleWasmPaths) {
              if (fs.existsSync(possiblePath)) {
                wasmPath = possiblePath;
                break;
              }
            }
            
            if (wasmPath) {
              const destPath = path.resolve(__dirname, 'dist/node/automerge_wasm_bg.wasm');
              fs.copyFileSync(wasmPath, destPath);
              console.log('WASM file copied successfully from', wasmPath, 'to', destPath);
            } else {
              console.error('WASM file not found in any of the expected locations');
            }
          } catch (err) {
            console.error('Error copying WASM file:', err);
          }
        });
      }
    }
  ],
};

// Export both configurations
module.exports = [browserConfig, nodeConfig];
