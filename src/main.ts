import * as core from '@actions/core'
import {context} from '@actions/github'
import {isExistingRelease} from './is-existing-release'

export const run = async (): Promise<void> => {
  const {owner, repo} = context.repo

  try {
    const skipPattern: string = core.getInput('skip-pattern')
    const commitMessage: string = core.getInput('commit-message')

    if (skipPattern && !commitMessage) {
      throw new Error(
        `commit-message unspecified. skip-pattern (${skipPattern}) requires specifying a commit-message`
      )
    }

    if (skipPattern && commitMessage && commitMessage.includes(skipPattern)) {
      core.setOutput('exists', false)
      core.info(
        `skipping ensure-unpublished-release; commit specifies ${skipPattern}`
      )
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
