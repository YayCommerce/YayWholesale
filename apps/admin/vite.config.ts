import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
// import analyze from "rollup-plugin-analyzer"
// import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import pluginExternal from 'vite-plugin-external';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, 'env');
  const env = loadEnv(mode, envDir);

  return {
    root: './src',
    envDir,

    plugins: [
      react({ jsxRuntime: 'classic' }),
      tailwindcss(),
      pluginExternal({
        interop: 'auto',
        development: { externals: externalDev },
        'development-lite': { externals: externalDev },
        production: { externals: externalProd },
        'production-lite': { externals: externalProd },
      }),
      // visualizer({ template: 'flamegraph', emitFile: true, filename: 'stats.html' }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      minify: 'terser',
      terserOptions: terserOptions,
      manifest: false,
      emptyOutDir: true,
      outDir: path.resolve('../assets', 'dist'),
      assetsDir: '',
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/main.tsx'),
        },
        output: {
          entryFileNames: 'js/[name].js',
          assetFileNames: '[name].[ext]',
        },
        plugins: [
          // analyze({ summaryOnly: true, limit:10 }),
        ],
      },
    },
    server: {
      cors: true,
      strictPort: true,
      port: 3000,
      origin: env.VITE_SERVER_ORIGIN,
      hmr: {
        port: 3000,
        host: 'localhost',
        protocol: 'ws',
      },
    },
  };
});

const terserOptions = {
  output: {
    comments: /translators:/i,
  },
  compress: {
    passes: 2,
  },
  mangle: {
    reserved: ['__', '_n', '_nx', '_x'],
  },
};
const externalDev = {
  '@wordpress/hooks': 'wp.hooks',
  '@wordpress/i18n': 'wp.i18n',
};
const externalProd = {
  '@wordpress/element': 'wp.element',
  '@wordpress/components': 'wp.components',
  '@wordpress/hooks': 'wp.hooks',
  '@wordpress/i18n': 'wp.i18n',
  '@wordpress/date': 'wp.date',
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/client': 'ReactDOM',
};
