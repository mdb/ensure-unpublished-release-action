import * as core from '@actions/core'
import {RequestError} from '@octokit/request-error'
import {getOctokit} from '@actions/github'

export const isExistingRelease = async (
  owner: string,
  repo: string,
  tag: string
): Promise<boolean> => {
  const token: string = core.getInput('token')
  const octokit = getOctokit(token)

  try {
    await octokit.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag
    })

    return true
  } catch (error) {
    if ((error as RequestError)?.status === 404) {
      return false
    }

    throw error
  }
}
