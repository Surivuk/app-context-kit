import { defineConfig } from 'tsdown'

export default defineConfig({
    format: ["esm", "cjs"],
    entry: ['./src/index.ts'],
    clean: true,
    dts: true,
    minify: false,
})