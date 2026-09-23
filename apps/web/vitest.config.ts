import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@spendflow/shared/schemas': path.resolve(__dirname, '../../packages/shared/src/schemas/index.ts'),
      '@spendflow/shared/types': path.resolve(__dirname, '../../packages/shared/src/types/index.ts'),
      '@spendflow/shared/seed': path.resolve(__dirname, '../../packages/shared/src/seed/index.ts'),
    },
  },
});
