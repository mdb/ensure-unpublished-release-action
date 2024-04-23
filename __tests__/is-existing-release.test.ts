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
    getOctokit: jest.fn(() => mockOctokit)
  }
})

test('finds a corresponding release tag', async () => {
  mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'result')

  const exists = await isExistingRelease('mdb', 'terraputs', '0.0.0')

  expect(exists).toBe(true)
})

test('does not find a corresponding release tag', async () => {
  mockOctokit.rest.repos.getReleaseByTag = jest
    .fn<() => Promise<never>>()
    .mockRejectedValue({
      status: 404
    })

  const exists = await isExistingRelease('mdb', 'terraputs', '500.0.0')

  expect(exists).toBe(false)
})

test('the GitHub API responds with an error', async () => {
  const response = {status: 500}

  mockOctokit.rest.repos.getReleaseByTag = jest
    .fn<() => Promise<never>>()
    .mockRejectedValueOnce(response)

  await expect(
    isExistingRelease('mdb', 'terraputs', '500.0.0')
  ).rejects.toStrictEqual(response)
})
