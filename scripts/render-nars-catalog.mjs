import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const scripts = ['render-nars-index.mjs', 'render-nars-pages.mjs']
const args = process.argv.includes('--write') ? ['--write'] : []

for (const script of scripts) {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], {
    cwd: ROOT,
    stdio: 'inherit',
  })
}
