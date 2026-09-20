import { spawnSync } from 'node:child_process'

const confirmed = process.argv.includes('--confirm=tencent-main')
const dryRun = process.argv.includes('--dry-run')

if (!confirmed && !dryRun) {
  console.error('拒绝发布：需要显式参数 --confirm=tencent-main')
  process.exit(2)
}

const branch = spawnSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).stdout.trim()
const status = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).stdout.trim()
if (branch !== 'main') {
  console.error(`拒绝发布：当前分支是 ${branch || '未知'}，生产发布只能从 main 发起`)
  process.exit(2)
}
if (status) {
  console.error('拒绝发布：工作区存在未提交改动，请先提交并推送 main')
  process.exit(2)
}

const args = ['workflow', 'run', 'deploy.yml', '--repo', 'exomind-team/agi-society-cn', '--ref', 'main', '-f', 'publish_tencent=true']
console.log(`gh ${args.join(' ')}`)

if (dryRun) process.exit(0)

const result = spawnSync('gh', args, { stdio: 'inherit' })
if (result.error) {
  console.error(`无法调用 gh：${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)
