import {RequestError} from '@octokit/request-error'
import {getOctokit} from '@actions/github'

export const isExistingRelease = async (
  owner: string,
  repo: string,
  tag: string
): Promise<boolean> => {
  const octokit = getOctokit(process.env.GITHUB_TOKEN || '')

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
