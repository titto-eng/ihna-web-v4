import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true }, // Vite 8 resolves the tsconfig `paths` (@/...) itself
  test: {
    environment: 'node', // jsdom 28 needs Node >= 22.12 (require(esm)); component tests opt in with a docblock
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'tests/collections/**/*.test.ts', 'tests/portal/**/*.test.ts', 'tests/courses/**/*.test.ts', 'tests/import/**/*.test.ts', 'tests/seo/**/*.test.ts', 'tests/templates/**/*.test.ts', 'tests/enquiries/**/*.test.ts', 'tests/payments/**/*.test.ts', 'tests/alumni/**/*.test.ts', 'tests/legacy-media/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 180_000,
  },
})
