import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Block renderer tests. Run: npx vitest run --config tests/blocks/vitest.config.mts
// (vitest.config.mts, which `npm run test:int` uses, only includes tests/int; see report.)
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true }, // Vite 8 resolves the tsconfig `paths` (@/...) itself
  test: {
    environment: 'happy-dom',
    environmentOptions: { happyDOM: { settings: { disableIframePageLoading: true } } },
    include: ['tests/blocks/**/*.test.tsx', 'tests/templates/**/*.test.tsx', 'tests/payments/**/*.test.tsx'],
    setupFiles: ['./tests/blocks/setup.ts'],
  },
})
