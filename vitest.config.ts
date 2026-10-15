import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [],
	test: {
		name: 'node',
		root: './',
		environment: 'node',
		coverage: {
			provider: 'v8'
		}
	},
})
