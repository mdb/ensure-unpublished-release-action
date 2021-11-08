import * as core from '@actions/core'
import {context} from '@actions/github'
import {jest, expect, test} from '@jest/globals'
import {run} from '../src/main'

const mockOctokit = {
  rest: {
    repos: {
      getReleaseByTag: jest.fn()
    }
  }
}

const repoOwner = 'mdb'
const repoName = 'terraputs'

jest.mock('@actions/github', () => {
  return {
    getOctokit: jest.fn(() => mockOctokit),
    context: {
      repo: {
        owner: 'mdb',
        repo: 'terraputs'
      }
    }
  }
})

const tag = '500.0.0'

jest.spyOn(core, 'info').mockImplementation(jest.fn())
jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())

test('release does not exist', async () => {
  mockOctokit.rest.repos.getReleaseByTag.mockRejectedValueOnce({
    status: 404
  })

  process.env['INPUT_TAG'] = tag

  await run()

  expect(core.setFailed).not.toHaveBeenCalled()
  expect(core.info).toHaveBeenCalledWith(
    `mdb/terraputs release tag ${tag} does not exist`
  )
})

test('release exists', async () => {
  mockOctokit.rest.repos.getReleaseByTag.mockImplementation(() => 'found')

  process.env['INPUT_TAG'] = tag

  await run()

  expect(core.setFailed).toHaveBeenCalledWith(
    `mdb/terraputs release tag ${tag} exists`
  )
  expect(core.info).not.toHaveBeenCalled()
})
