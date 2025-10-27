import * as core from '@actions/core'
import {isExistingRelease, shouldSkip} from '../src/is-existing-release'
import {jest, expect, test, describe, afterEach} from '@jest/globals'

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

jest.spyOn(core, 'info').mockImplementation(jest.fn())
jest.spyOn(core, 'warning').mockImplementation(jest.fn())

afterEach(() => {
  process.env['INPUT_TAG'] = ''
  process.env['INPUT_FAILURE-MESSAGE'] = ''
  process.env['INPUT_SKIP-PATTERN'] = ''
  process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = ''
  process.env['INPUT_COMMIT-MESSAGE'] = ''
  process.env['INPUT_SKIP-AUTHOR'] = ''
  process.env['INPUT_AUTHOR'] = ''
})

describe('#isExistingRelease', () => {
  test('when it finds a corresponding release tag', async () => {
    mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'result')

    const exists = await isExistingRelease('mdb', 'terraputs', '0.0.0')

    expect(exists).toBe(true)
  })

  test('when it does not find a corresponding release tag', async () => {
    mockOctokit.rest.repos.getReleaseByTag = jest
      .fn<() => Promise<never>>()
      .mockRejectedValue({
        status: 404
      })

    const exists = await isExistingRelease('mdb', 'terraputs', '500.0.0')

    expect(exists).toBe(false)
  })

  test('when the GitHub API responds with an error', async () => {
    const response = {status: 500}

    mockOctokit.rest.repos.getReleaseByTag = jest
      .fn<() => Promise<never>>()
      .mockRejectedValueOnce(response)

    await expect(
      isExistingRelease('mdb', 'terraputs', '500.0.0')
    ).rejects.toStrictEqual(response)
  })
})

describe('#shouldSkip', () => {
  test('when the specified commit-message includes the specified skip-pattern', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

    const result = shouldSkip()

    expect(result).toBe(true)
    expect(core.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
    )
    expect(core.warning).toHaveBeenCalledWith(
      'skip-pattern is deprecated. Use skip-commit-message-pattern.'
    )
  })

  test('when the specified commit-message includes the specified skip-commit-message-pattern', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

    const result = shouldSkip()

    expect(result).toBe(true)
    expect(core.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
    )
  })

  test('when a skip-commit-message-pattern is defined but no commit-message is defined', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = ''

    expect(shouldSkip).toThrow(
      `commit-message unspecified. skip-commit-message-pattern (${skipPattern}) requires specifying a commit-message`
    )
  })

  test('when the skip-authors includes the author', async () => {
    const author = 'foo-bar'
    process.env['INPUT_SKIP-AUTHORS'] = `foo-bar
baz
bim`
    process.env['INPUT_AUTHOR'] = author

    const result = shouldSkip()
    expect(result).toBe(true)
    expect(core.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; author is ${author}`
    )
  })

  test('when a skip-authors is defined but no author is defined', async () => {
    const skipAuthors = 'foo-bar'
    process.env['INPUT_SKIP-AUTHORS'] = skipAuthors
    process.env['INPUT_AUTHOR'] = ''

    expect(shouldSkip).toThrow(
      `author unspecified. skip-authors (${skipAuthors}) requires specifying an author`
    )
  })
})
