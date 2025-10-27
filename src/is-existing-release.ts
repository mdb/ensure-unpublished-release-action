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

export const shouldSkip = (): boolean => {
  const skipPattern: string = core.getInput('skip-pattern')
  if (skipPattern) {
    core.warning('skip-pattern is deprecated. Use skip-commit-message-pattern.')
  }

  const skipCommitMessagePattern: string = core.getInput(
    'skip-commit-message-pattern'
  )
  const skipMessagePattern = skipCommitMessagePattern || skipPattern
  const commitMessage: string = core.getInput('commit-message')

  if (skipMessagePattern && !commitMessage) {
    throw new Error(
      `commit-message unspecified. skip-commit-message-pattern (${skipMessagePattern}) requires specifying a commit-message`
    )
  }

  if (
    skipMessagePattern &&
    commitMessage &&
    commitMessage.includes(skipMessagePattern)
  ) {
    core.info(
      `skipping ensure-unpublished-release; commit specifies ${skipMessagePattern}`
    )
    return true
  }

  const skipAuthors: string = core.getInput('skip-authors')
  const author: string = core.getInput('author')
  const skipAuthorsList = skipAuthors.split('\n')

  if (skipAuthors && !author) {
    throw new Error(
      `author unspecified. skip-authors (${skipAuthorsList.join(', ')}) requires specifying an author`
    )
  }

  if (skipAuthors && author && skipAuthorsList.includes(author.toLowerCase())) {
    core.info(`skipping ensure-unpublished-release; author is ${author}`)
    return true
  }

  return false
}
