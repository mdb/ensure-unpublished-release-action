import * as core from '@actions/core'
import {context} from '@actions/github'
import {isExistingRelease, shouldSkip} from './is-existing-release'

export const run = async (): Promise<void> => {
  const {owner, repo} = context.repo

  try {
    const skipped = shouldSkip() ? true : false
    core.setOutput('skipped', skipped)

    const tag: string = core.getInput('tag')
    const exists = await isExistingRelease(owner, repo, tag)
    core.setOutput('exists', exists)

    let failureMessage = `${owner}/${repo} release tag ${tag} exists`
    const customFailureMessage: string = core.getInput('failure-message')
    if (customFailureMessage !== '') {
      failureMessage += `. ${customFailureMessage}`
    }

    if (exists && !skipped) {
      core.setFailed(failureMessage)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

if (process.env.NODE_ENV !== 'test') run()
