// Exact 2026-10-20 homepage-layout exception. Never normalize an unknown change.
// Earlier retention layers still compare their original historical baselines.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
const contract = JSON.parse(fs.readFileSync(new URL('./home-layout-contract.json', import.meta.url), 'utf8'))
export const homeLayoutFiles = Object.keys(contract.files)
const sha = value => crypto.createHash('sha256').update(value).digest('hex')
// Only these four contracted text files use LF-canonical hashes. Latin-1 round
// trips every byte, replacing CRLF only; no other whitespace/content is ignored.
const lfBytes = bytes => Buffer.from(bytes.toString('latin1').replace(/\r\n/g, '\n'), 'latin1')
export function beforeHomeLayout(file, value) {
  const entry = contract.files[file]
  if (!entry) return value
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value)
  assert.equal(sha(lfBytes(bytes)), entry.after, `Unknown homepage-layout modification: ${file}`)
  const before = execFileSync('git', ['show', `${contract.baseline}:${file}`], { maxBuffer: 64 * 1024 * 1024 })
  assert.equal(sha(lfBytes(before)), entry.before, `Homepage-layout baseline changed: ${file}`)
  // Preserve the original baseline format for the older retention layers.
  return Buffer.isBuffer(value) ? before : before.toString()
}
