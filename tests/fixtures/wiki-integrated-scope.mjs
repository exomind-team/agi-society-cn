// Scope for retention layers that predate the already-reviewed Wiki integration.
// The post-542 people scope remains unchanged in wiki-relations-scope.mjs.
// Derive a bounded path list from two reachable immutable trees, not a directory
// allowlist, and verify integration-only files still equal the accepted 542 tree.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { pathwaysBaselineTree, pathwaysChanged, pathwaysAdded } from './agi-pathways-scope.mjs'
import { wikiRelationsBaseline, wikiRelationsChanged as peopleChanged, wikiRelationsAdded as peopleAdded } from './wiki-relations-scope.mjs'
import { beforeHomeLayout, homeLayoutFiles } from './home-layout-scope.mjs'
const pathwaysCommit = '46defc80120df0fd83c2f01aa9ae12c5465a5107'
for (const commit of [pathwaysCommit, wikiRelationsBaseline]) {
  assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', commit, 'HEAD']).status, 0, `Unreachable retention baseline: ${commit}`)
}
assert.equal(execFileSync('git', ['rev-parse', `${pathwaysCommit}^{tree}`], { encoding:'utf8' }).trim(), pathwaysBaselineTree)
const rows = execFileSync('git', ['diff', '--name-status', '--no-renames', '-z', pathwaysBaselineTree, wikiRelationsBaseline, '--', 'content', 'data', '.vitepress', 'docs']).toString().split('\0').filter(Boolean)
const changed = [], added = []
for (let i=0; i<rows.length; i+=2) {
  const [status, file] = rows.slice(i,i+2)
  assert.ok(['A','M'].includes(status), `Unexpected integration operation: ${status} ${file}`)
  if (pathwaysChanged.includes(file) || pathwaysAdded.includes(file)) continue
  ;(status === 'A' ? added : changed).push(file)
  if (peopleChanged.includes(file)) continue
  if (homeLayoutFiles.includes(file)) {
    const normalized = beforeHomeLayout(file, fs.readFileSync(file))
    const accepted = execFileSync('git', ['show', `${wikiRelationsBaseline}:${file}`], { maxBuffer:64*1024*1024 })
    assert.ok(normalized.equals(accepted), `Accepted integration file changed: ${file}`)
  } else {
    const diff = spawnSync('git', ['diff', '--quiet', '--no-ext-diff', wikiRelationsBaseline, '--', file], { encoding:'utf8' })
    assert.equal(diff.status, 0, `Accepted integration file changed: ${file} ${diff.stderr || ''}`)
  }
}
export const wikiRelationsChanged = [...new Set([...changed, ...peopleChanged])]
export const wikiRelationsAdded = [...new Set([...added, ...peopleAdded])]
