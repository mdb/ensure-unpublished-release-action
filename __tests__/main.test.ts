import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'

// NOTE: these tests require `npm run build` to have been invoked

/*
test('release does not exist', () => {
  const tag = '500.0.0'
  process.env['INPUT_TAG'] = tag

  const repo = 'mdb/terraputs'
  process.env['GITHUB_REPOSITORY'] = repo

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  const result = cp.execFileSync(np, [ip], options).toString()
  console.log(`RESULT: ${result}`)

  expect(result).toBe(`${repo} release tag ${tag} does not exist`)
})

test('release exists', () => {
  const tag = '0.0.0'
  process.env['INPUT_TAG'] = tag

  const repo = 'mdb/terraputs'
  process.env['GITHUB_REPOSITORY'] = repo

  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  const result = cp.execFileSync(np, [ip], options).toString()
  console.log(`RESULT: ${result}`)

  expect(result).toBe(`${repo} release tag ${tag} exists`)
})
*/
