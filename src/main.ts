import * as core from '@actions/core'
import {context} from '@actions/github'
import {isExistingRelease} from './is-existing-release'

export const run = async (): Promise<void> => {
  const {owner, repo} = context.repo

  try {
    const tag: string = core.getInput('tag')
    const exists = await isExistingRelease(owner, repo, tag)

    if (exists) {
      core.setOutput('exists', true)
      core.setFailed(`${owner}/${repo} release tag ${tag} exists`)
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
