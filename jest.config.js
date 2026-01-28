/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  clearMocks: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  preset: 'ts-jest',
  resolver: 'ts-jest-resolver',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true
      }
    ]
  },
  verbose: true
}
