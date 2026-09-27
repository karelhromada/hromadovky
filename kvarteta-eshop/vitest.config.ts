import { defineConfig } from 'vitest/config';

// Jen unit testy v src/. Skripty v scripts/*.test.mjs běží samostatně přes `node <soubor>`
// (node:assert, bez závislostí) – vitest by je hlásil jako „No test suite found".
export default defineConfig({
    test: {
        include: ['src/**/*.test.{ts,tsx}'],
    },
});
