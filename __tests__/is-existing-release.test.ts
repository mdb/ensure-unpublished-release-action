import {isExistingRelease} from '../src/is-existing-release'
import {jest, expect, test} from '@jest/globals'

const mockOctokit = {
  rest: {
    repos: {
      getReleaseByTag: jest.fn()
    }
  }
}

jest.mock('@actions/github', () => {
  return {
    getOktokit: jest.fn(() => mockOctokit)
  }
})

test('finds a corresponding release tag', async () => {
  const result: string = 'found'

  mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'result')

  const exists = await isExistingRelease('mdb', 'terraputs', '0.0.0')

  expect(exists).toBe(true)
})

test('does not find a corresponding release tag', async () => {
  mockOctokit.rest.repos.getReleaseByTag.mockRejectedValueOnce({
    status: 404
  })

  const exists = await isExistingRelease('mdb', 'terraputs', '500.0.0')

  expect(exists).toBe(false)
})
