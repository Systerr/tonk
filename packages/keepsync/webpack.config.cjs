const path = require('path');

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
    '@automerge/automerge': '@automerge/automerge',
  },
  optimization: {
    minimize: false,
  },
};

// Browser-specific configuration
const browserConfig = {
  ...commonConfig,
  name: 'browser',
  entry: './src/browser.ts',
  resolve: {
    ...commonConfig.resolve,
    alias: {
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
    filename: 'index.js',
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
  },
  experiments: {
    outputModule: true,
    asyncWebAssembly: true,
  },
  externals: {
    ...commonConfig.externals,
    'node-fetch': 'node-fetch',
    'ws': 'ws',
    'fake-indexeddb': 'fake-indexeddb'
  },
  target: ['node', 'es2020'],
};

// Export both configurations
module.exports = [browserConfig, nodeConfig];
