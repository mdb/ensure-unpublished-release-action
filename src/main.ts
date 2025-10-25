import * as core from '@actions/core'
import {context} from '@actions/github'
import {isExistingRelease, shouldSkip} from './is-existing-release'

export const run = async (): Promise<void> => {
  const {owner, repo} = context.repo

  try {
    if (shouldSkip()) {
      core.setOutput('exists', false)
      core.setOutput('skipped', true)
      return
    }

    core.setOutput('skipped', false)

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
