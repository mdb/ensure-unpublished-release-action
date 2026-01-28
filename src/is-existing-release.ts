import * as core from '@actions/core'
import {RequestError} from '@octokit/request-error'
import {getOctokit} from '@actions/github'
import {
  authorInput,
  commitMessageInput,
  skipAuthorsInput,
  skipCommitMessagePatternInput,
  skipPatternInput
} from './inputs.js'

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
      core.info(`${owner}/${repo} release tag ${tag} does not exist`)
      return false
    }

    throw error
  }
}

export const shouldSkip = (): boolean => {
  const skipPattern: string = core.getInput(skipPatternInput)
  if (skipPattern) {
    core.warning(
      `${skipPatternInput} is deprecated. Use ${skipCommitMessagePatternInput}.`
    )
  }

  const skipCommitMessagePattern: string = core.getInput(
    skipCommitMessagePatternInput
  )
  const skipMessagePattern = skipCommitMessagePattern || skipPattern
  const commitMessage: string = core.getInput(commitMessageInput)

  if (skipMessagePattern && !commitMessage) {
    throw new Error(
      `${commitMessageInput} unspecified. ${skipCommitMessagePatternInput} (${skipMessagePattern}) requires specifying a ${commitMessageInput}`
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

  const skipAuthors: string = core.getInput(skipAuthorsInput)
  const author: string = core.getInput(authorInput)
  const skipAuthorsList = skipAuthors.split('\n')

  if (skipAuthors && !author) {
    throw new Error(
      `${authorInput} unspecified. ${skipAuthorsInput} (${skipAuthorsList.join(', ')}) requires specifying an ${authorInput}`
    )
  }

  if (skipAuthors && author && skipAuthorsList.includes(author.toLowerCase())) {
    core.info(
      `skipping ensure-unpublished-release; ${authorInput} is ${author}`
    )
    return true
  }

  return false
}
