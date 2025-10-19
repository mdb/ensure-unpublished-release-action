import * as core from '@actions/core'
import {context} from '@actions/github'
import {isExistingRelease} from './is-existing-release'

export const run = async (): Promise<void> => {
  const {owner, repo} = context.repo

  try {
    const skipMessagePattern: string = core.getInput(
      'skip-commit-message-pattern'
    )
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
      core.setOutput('exists', false)
      core.info(
        `skipping ensure-unpublished-release; commit specifies ${skipMessagePattern}`
      )
      return
    }

    const skipAuthor: string = core.getInput('skip-author')
    const author: string = core.getInput('author')

    if (skipAuthor && !author) {
      throw new Error(
        `author unspecified. skip-author (${skipAuthor}) requires specifying an author`
      )
    }

    if (
      skipAuthor &&
      author &&
      author.toLowerCase() === skipAuthor.toLowerCase()
    ) {
      core.setOutput('exists', false)
      core.info(`skipping ensure-unpublished-release; author is ${skipAuthor}`)
      return
    }

    const tag: string = core.getInput('tag')
    const exists = await isExistingRelease(owner, repo, tag)
    const customFailureMessage: string = core.getInput('failure-message')
    let failureMessage = `${owner}/${repo} release tag ${tag} exists`
    if (customFailureMessage !== '') {
      failureMessage += `. ${customFailureMessage}`
    }

    if (exists) {
      core.setOutput('exists', true)
      core.setFailed(failureMessage)
    }

    if (!exists) {
      core.setOutput('exists', false)
      core.info(`${owner}/${repo} release tag ${tag} does not exist`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

if (process.env.NODE_ENV !== 'test') run()
