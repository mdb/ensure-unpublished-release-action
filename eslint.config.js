import {defineConfig} from 'eslint/config'

export default defineConfig([
  {
    ignores: ['coverage/', 'dist/', 'node_modules/']
  },
  {
    rules: {
      'prefer-const': 'error'
    }
  }
])
