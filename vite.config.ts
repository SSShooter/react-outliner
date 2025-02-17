import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [react(),
      dts({
        tsconfigPath: 'tsconfig.app.json',
        insertTypesEntry: true,
      })
      ],
      optimizeDeps: {
        exclude: ['lucide-react'],
      },
      build: {
        lib: {
          entry: resolve(__dirname, 'src/components/Outliner.tsx'),
          name: 'ReactOutlinerNeo',
          formats: ['es'],
          fileName: 'react-outliner-neo',
        },
        rollupOptions: {
          external: ['react', 'react-dom'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
          },
        },
      },
    };
  }

  // 默认构建模式（演示页面）
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
