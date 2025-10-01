import {defineConfig} from 'eslint/config'

export default defineConfig([
  {
    ignores: ['dist/', 'node_modules/']
  },
  {
    rules: {
      'prefer-const': 'error'
    }
  }
])
