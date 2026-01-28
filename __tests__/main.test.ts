import {jest, expect, test, afterEach, describe} from '@jest/globals'

const mockOctokit = {
  rest: {
    repos: {
      getReleaseByTag: jest.fn()
    }
  }
}

const mockCore = {
  getInput: jest.fn(
    (name: string) => process.env[`INPUT_${name.toUpperCase()}`] || ''
  ),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
}

jest.unstable_mockModule('@actions/core', () => mockCore)

jest.unstable_mockModule('@actions/github', () => ({
  context: {
    get repo() {
      const [owner, repo] = (process.env['GITHUB_REPOSITORY'] || '/').split('/')
      return {owner, repo}
    }
  },
  getOctokit: jest.fn(() => mockOctokit)
}))

const {run} = await import('../src/main.js')

const repo = 'mdb/terraputs'
const tag = '500.0.0'

afterEach(() => {
  jest.clearAllMocks()
  process.env['INPUT_TAG'] = ''
  process.env['INPUT_FAILURE-MESSAGE'] = ''
  process.env['INPUT_SKIP-PATTERN'] = ''
  process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = ''
  process.env['INPUT_COMMIT-MESSAGE'] = ''
  process.env['INPUT_SKIP-AUTHOR'] = ''
  process.env['INPUT_AUTHOR'] = ''
})

describe('#run', () => {
  test('when the release does not exist', async () => {
    mockOctokit.rest.repos.getReleaseByTag = jest
      .fn<() => Promise<never>>()
      .mockRejectedValueOnce({
        status: 404
      })

    process.env['INPUT_TAG'] = tag
    process.env['GITHUB_REPOSITORY'] = repo

    await run()

    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(mockCore.info).toHaveBeenCalledWith(
      `${repo} release tag ${tag} does not exist`
    )
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', false)
    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', false)
  })

  test('when the release exists', async () => {
    mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'found')

    process.env['INPUT_TAG'] = tag
    process.env['GITHUB_REPOSITORY'] = repo

    await run()

    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', false)
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', true)
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      `${repo} release tag ${tag} exists`
    )
  })

  test('when the release exists with custom failure message', async () => {
    mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'found')

    process.env['INPUT_TAG'] = tag
    process.env['INPUT_FAILURE-MESSAGE'] = 'Do something.'
    process.env['GITHUB_REPOSITORY'] = repo

    await run()

    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', false)
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', true)
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      `${repo} release tag ${tag} exists. Do something.`
    )
  })

  test('when an error occurs fetching GitHub release data', async () => {
    const errMessage = 'some error'

    mockOctokit.rest.repos.getReleaseByTag = jest
      .fn<() => Promise<never>>()
      .mockRejectedValueOnce(new Error(errMessage))

    process.env['INPUT_TAG'] = tag
    process.env['GITHUB_REPOSITORY'] = repo

    await run()

    expect(mockCore.setFailed).toHaveBeenCalledWith(errMessage)
    expect(mockCore.info).not.toHaveBeenCalled()
  })

  test('when the specified commit-message includes the specified skip-pattern and the release exists', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

    await run()

    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(mockCore.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
    )
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', true)
    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', true)
    expect(mockCore.warning).toHaveBeenCalledWith(
      'skip-pattern is deprecated. Use skip-commit-message-pattern.'
    )
  })

  test('when the specified commit-message includes the specified skip-pattern and the release does not exist', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

    mockOctokit.rest.repos.getReleaseByTag = jest
      .fn<() => Promise<never>>()
      .mockRejectedValueOnce({
        status: 404
      })

    await run()

    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(mockCore.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
    )
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', false)
    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', true)
    expect(mockCore.warning).toHaveBeenCalledWith(
      'skip-pattern is deprecated. Use skip-commit-message-pattern.'
    )
  })

  test('when the specified commit-message includes the specified skip-commit-message-pattern and the release exists', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

    await run()

    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(mockCore.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
    )
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', true)
    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', true)
  })

  test('when the specified commit-message includes the specified skip-commit-message-pattern and the release does not exist', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = `foo bar ${skipPattern} foo bar`

    mockOctokit.rest.repos.getReleaseByTag = jest
      .fn<() => Promise<never>>()
      .mockRejectedValueOnce({
        status: 404
      })

    await run()

    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(mockCore.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; commit specifies [skip version-eval]`
    )
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', false)
    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', true)
  })

  test('when a skip-commit-message-pattern is defined but no commit-message is defined', async () => {
    const skipPattern = '[skip version-eval]'
    process.env['INPUT_SKIP-COMMIT-MESSAGE-PATTERN'] = skipPattern
    process.env['INPUT_COMMIT-MESSAGE'] = ''

    await run()

    const errMessage = `commit-message unspecified. skip-commit-message-pattern (${skipPattern}) requires specifying a commit-message`
    expect(mockCore.setFailed).toHaveBeenCalledWith(errMessage)
    expect(mockCore.setOutput).not.toHaveBeenCalled()
  })

  test('when the skip-authors includes the author and the release exists', async () => {
    const author = 'foo-bar'
    process.env['INPUT_SKIP-AUTHORS'] = `foo-bar
baz
bim`
    process.env['INPUT_AUTHOR'] = author

    await run()

    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(mockCore.info).toHaveBeenCalledWith(
      `skipping ensure-unpublished-release; author is ${author}`
    )
    expect(mockCore.setOutput).toHaveBeenCalledWith('exists', true)
    expect(mockCore.setOutput).toHaveBeenCalledWith('skipped', true)
  })

  test('when a skip-authors is defined but no author is defined', async () => {
    const skipAuthors = 'foo-bar'
    process.env['INPUT_SKIP-AUTHORS'] = skipAuthors
    process.env['INPUT_AUTHOR'] = ''

    await run()

    const errMessage = `author unspecified. skip-authors (${skipAuthors}) requires specifying an author`
    expect(mockCore.setFailed).toHaveBeenCalledWith(errMessage)
    expect(mockCore.setOutput).not.toHaveBeenCalled()
  })
})
