import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'

const token = process.env.GITEA_TOKEN?.trim()
const sha = process.env.GITHUB_SHA?.trim()
const apiBase = (process.env.GITEA_API_BASE || 'https://gitea.hailay.site/api/v1').replace(/\/$/, '')
const repository = process.env.GITEA_REPOSITORY || 'agiteam/agi-society-cn'
const retention = Number.parseInt(process.env.GITEA_RELEASE_RETENTION || '16', 10)
const archivePath = process.env.GITEA_ARCHIVE_PATH || `wiki-mirror-${sha}.tar.gz`
const checksumPath = process.env.GITEA_CHECKSUM_PATH || `${archivePath}.sha256`

if (!token) throw new Error('GITEA_TOKEN is required')
if (!sha || !/^[0-9a-f]{40}$/.test(sha)) throw new Error('GITHUB_SHA must be a 40-character commit SHA')
if (!Number.isInteger(retention) || retention < 1) throw new Error('GITEA_RELEASE_RETENTION must be a positive integer')

const repositoryApi = `${apiBase}/repos/${repository}`
const tagName = `deploy-${sha}`
const releaseName = `Wiki mirror ${sha.slice(0, 12)}`
const headers = {
  Accept: 'application/json',
  Authorization: `token ${token}`,
}

async function request(path, options = {}) {
  const response = await fetch(`${repositoryApi}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  })
  const text = await response.text()
  let body = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body)
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${detail}`)
  }
  return body
}

async function getRelease() {
  const response = await fetch(`${repositoryApi}/releases/tags/${encodeURIComponent(tagName)}`, { headers })
  if (response.status === 404) return null
  const text = await response.text()
  if (!response.ok) throw new Error(`GET release ${tagName} failed: ${response.status} ${text}`)
  return JSON.parse(text)
}

async function uploadAsset(releaseId, filePath, contentType) {
  const content = await readFile(filePath)
  const checksum = createHash('sha256').update(content).digest('hex')
  const name = filePath.split(/[\\/]/).pop()
  await request(`/releases/${releaseId}/assets?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(content.byteLength),
    },
    body: content,
  })
  console.log(`uploaded ${name} (${content.byteLength} bytes, sha256=${checksum})`)
}

async function ensureAsset(release, filePath, contentType) {
  const name = filePath.split(/[\\/]/).pop()
  const assets = await request(`/releases/${release.id}/assets?limit=50`)
  if (assets.some((asset) => asset.name === name)) {
    console.log(`asset already exists: ${name}`)
    return
  }
  await uploadAsset(release.id, filePath, contentType)
}

let release = await getRelease()
if (!release) {
  release = await request('/releases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag_name: tagName,
      target_commitish: 'main',
      name: releaseName,
      body: [
        `Source commit: ${sha}`,
        `GitHub run: ${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${process.env.GITHUB_REPOSITORY || 'exomind-team/agi-society-cn'}/actions/runs/${process.env.GITHUB_RUN_ID || 'unknown'}`,
        'This release contains the root-path static artifact for Tencent Cloud deployment.',
      ].join('\n'),
      draft: false,
      prerelease: false,
    }),
  })
  console.log(`created release ${tagName}`)
} else {
  console.log(`release already exists: ${tagName}`)
}

await ensureAsset(release, archivePath, 'application/gzip')
await ensureAsset(release, checksumPath, 'text/plain; charset=utf-8')

const releases = []
for (let page = 1; page <= 10; page += 1) {
  const batch = await request(`/releases?limit=50&page=${page}`)
  releases.push(...batch)
  if (batch.length < 50) break
}

const deployReleases = releases
  .filter((item) => /^deploy-[0-9a-f]{40}$/.test(item.tag_name))
  .sort((left, right) => {
    const leftTime = Date.parse(left.created_at || left.published_at || left.updated_at || '') || 0
    const rightTime = Date.parse(right.created_at || right.published_at || right.updated_at || '') || 0
    return rightTime - leftTime
  })

for (const stale of deployReleases.slice(retention)) {
  await request(`/releases/${stale.id}`, { method: 'DELETE' })
  console.log(`deleted stale release ${stale.tag_name}`)
  const tagResponse = await fetch(`${repositoryApi}/tags/${encodeURIComponent(stale.tag_name)}`, {
    method: 'DELETE',
    headers,
  })
  if (tagResponse.status !== 204 && tagResponse.status !== 404) {
    const detail = await tagResponse.text()
    throw new Error(`DELETE tag ${stale.tag_name} failed: ${tagResponse.status} ${detail}`)
  }
  console.log(`deleted stale tag ${stale.tag_name}`)
}

console.log(`Gitea deployment releases retained: ${Math.min(deployReleases.length, retention)}/${retention}`)
