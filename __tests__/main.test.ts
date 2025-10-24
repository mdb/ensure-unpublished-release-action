import * as core from '@actions/core'
import {jest, expect, test, afterEach} from '@jest/globals'
import {run} from '../src/main'

const mockOctokit = {
  rest: {
    repos: {
      getReleaseByTag: jest.fn()
    }
  }
}

jest.mock('@actions/github', () => {
  return {
    ...(jest.requireActual('@actions/github') as object),
    getOctokit: jest.fn(() => mockOctokit)
  }
})

const repo = 'mdb/terraputs'
const tag = '500.0.0'

jest.spyOn(core, 'info').mockImplementation(jest.fn())
jest.spyOn(core, 'warning').mockImplementation(jest.fn())
jest.spyOn(core, 'setOutput').mockImplementation(jest.fn())
jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())

afterEach(() => {
  process.env['INPUT_TAG'] = ''
  process.env['INPUT_FAILURE-MESSAGE'] = ''
  process.env['INPUT_SKIP-PATTERN'] = ''
  process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = ''
  process.env['INPUT_COMMIT-MESSAGE'] = ''
  process.env['INPUT_SKIP-AUTHOR'] = ''
  process.env['INPUT_AUTHOR'] = ''
})

test('release does not exist', async () => {
  mockOctokit.rest.repos.getReleaseByTag = jest
    .fn<() => Promise<never>>()
    .mockRejectedValueOnce({
      status: 404
    })

  process.env['INPUT_TAG'] = tag
  process.env['GITHUB_REPOSITORY'] = repo

  await run()

  expect(core.setFailed).not.toHaveBeenCalled()
  expect(core.info).toHaveBeenCalledWith(
    `${repo} release tag ${tag} does not exist`
  )
  expect(core.setOutput).toHaveBeenCalledWith('exists', false)
  expect(core.setOutput).toHaveBeenCalledWith('skipped', false)
})

test('release exists', async () => {
  mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'found')

  process.env['INPUT_TAG'] = tag
  process.env['GITHUB_REPOSITORY'] = repo

  await run()

  expect(core.setOutput).toHaveBeenCalledWith('skipped', false)
  expect(core.setOutput).toHaveBeenCalledWith('exists', true)
  expect(core.setFailed).toHaveBeenCalledWith(
    `${repo} release tag ${tag} exists`
  )
})

test('release exists with custom failure message', async () => {
  mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'found')

  process.env['INPUT_TAG'] = tag
  process.env['INPUT_FAILURE-MESSAGE'] = 'Do something.'
  process.env['GITHUB_REPOSITORY'] = repo

  await run()

  expect(core.setOutput).toHaveBeenCalledWith('skipped', false)
  expect(core.setOutput).toHaveBeenCalledWith('exists', true)
  expect(core.setFailed).toHaveBeenCalledWith(
    `${repo} release tag ${tag} exists. Do something.`
  )
})

test('an error occurs fetching GitHub release data', async () => {
  const errMessage = 'some error'

  mockOctokit.rest.repos.getReleaseByTag = jest
    .fn<() => Promise<never>>()
    .mockRejectedValueOnce(new Error(errMessage))

  process.env['INPUT_TAG'] = tag
  process.env['GITHUB_REPOSITORY'] = repo

  await run()

  expect(core.setFailed).toHaveBeenCalledWith(errMessage)
  expect(core.info).not.toHaveBeenCalled()
})

test('the specified commit-message includes the specified skip-pattern', async () => {
  const skipPattern = '[skip version-eval]'
  process.env['INPUT_SKIP-PATTERN'] = skipPattern
  process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

  await run()

  expect(core.setFailed).not.toHaveBeenCalled()
  expect(core.info).toHaveBeenCalledWith(
    `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
  )
  expect(core.setOutput).toHaveBeenCalledWith('exists', false)
  expect(core.setOutput).toHaveBeenCalledWith('skipped', true)
  expect(core.warning).toHaveBeenCalledWith(
    'skip-pattern is deprecated. Use skip-commit-message-pattern.'
  )
})

test('the specified commit-message includes the specified skip-commit-message-pattern', async () => {
  const skipPattern = '[skip version-eval]'
  process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = skipPattern
  process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

  await run()

  expect(core.setFailed).not.toHaveBeenCalled()
  expect(core.info).toHaveBeenCalledWith(
    `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
  )
  expect(core.setOutput).toHaveBeenCalledWith('exists', false)
  expect(core.setOutput).toHaveBeenCalledWith('skipped', true)
})

test('a skip-commit-message-pattern is defined but no commit-message is defined', async () => {
  const skipPattern = '[skip version-eval]'
  process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = skipPattern
  process.env['INPUT_COMMIT-MESSAGE'] = ''

  await run()

  const errMessage = `commit-message unspecified. skip-commit-message-pattern (${skipPattern}) requires specifying a commit-message`
  expect(core.setFailed).toHaveBeenCalledWith(errMessage)
  expect(core.setOutput).not.toHaveBeenCalled()
})

test('the skip-authors includes the author', async () => {
  const author = 'foo-bar'
  process.env['INPUT_SKIP-AUTHORS'] = `foo-bar
baz
bim`
  process.env['INPUT_AUTHOR'] = author

  await run()

  expect(core.setFailed).not.toHaveBeenCalled()
  expect(core.info).toHaveBeenCalledWith(
    `skipping ensure-unpublished-release; author is ${author}`
  )
  expect(core.setOutput).toHaveBeenCalledWith('exists', false)
  expect(core.setOutput).toHaveBeenCalledWith('skipped', true)
})

test('a skip-authors is defined but no author is defined', async () => {
  const skipAuthors = 'foo-bar'
  process.env['INPUT_SKIP-AUTHORS'] = skipAuthors
  process.env['INPUT_AUTHOR'] = ''

  await run()

  const errMessage = `author unspecified. skip-authors (${skipAuthors}) requires specifying an author`
  expect(core.setFailed).toHaveBeenCalledWith(errMessage)
  expect(core.setOutput).not.toHaveBeenCalled()
})
