# Administrator editor: security and release boundaries

This is an independent local prototype, not a production administrator service. The ARC137 general, JavaScript, and presentation-layer standards apply. Review is an Agent review, not evidence of human takeover or native-browser acceptance.

## Four separate outcomes

| Action | Current meaning | Must not imply |
| --- | --- | --- |
| Save draft | Write private server-side working data, outside Git objects and history | Public content, completed build, remote sync |
| Confirm formal version | Compare revisions and append a local canonical content commit | Website deployment or remote publication |
| Build / deploy | Not implemented in this prototype | A successful local commit has updated the website |
| Remote sync | Disabled; no push API or credentials | Saving requires GitHub or has pushed to GitHub |

Restore appends a new canonical commit; it does not reset the branch or erase history. Drafts retained after publication require explicit UI status: retained does not mean never published. If a mutation succeeds and the following refresh fails, report the committed revision and refresh failure separately. A timeout or lost response is an uncertain outcome, not permission for a blind retry.

## Trust boundaries

- The CLI binds only to 127.0.0.1. Exact Host and Origin checks mitigate cross-site requests and DNS rebinding; they are **not authentication**. Any local process able to supply these headers can act as the prototype administrator.
- The data root, Git executable, server configuration, environment, and local OS account are trusted. Do not point the prototype at an attacker-writable repository or expose its listener through a tunnel/reverse proxy.
- Sensitive reads include drafts, previews, history, and historical content. They require the same request-origin boundary as writes and are served with `Cache-Control: no-store`.
- Only an explicit static asset allowlist is served. Data roots, `.git`, private drafts, source files, and arbitrary filesystem paths must never become static routes.
- Page IDs are server allowlisted; clients do not supply filesystem destinations, shell commands, Git ref updates, or arbitrary method names. Git is invoked with argument arrays, not through a shell.
- Read-only mode must be enforced in the server dispatcher, not merely by disabled UI controls. Returned capabilities should accurately describe that mode.
- Local private-file modes reduce accidental OS-level exposure; they do not replace user authorization, encrypted backups, or host security. Existing insecure directories must not be described as repaired unless actually checked.

## Content and privacy

The initial editor treats text as text. DOM preview and history must use text nodes, never compile submitted Vue, render raw HTML, or execute expressions. The initial content rejection policy is intentionally conservative, **not a complete sanitizer for arbitrary VitePress Markdown**. Markdown links and other syntax accepted as text must not be fed into a future compiler without a new safe-rendering design.

A real-source text-block adapter must preserve every byte outside its approved region, validate a pinned source revision and region identity, reject offsets moved by concurrent edits, and refuse attempts to turn edited text into frontmatter, Vue, executable code, or new source structure. Do not expose arbitrary offsets as write authority. Unsupported pages remain read-only; never silently strip components or metadata to make a fixture editable.

Private drafts must not enter canonical Git objects/history, generated public artifacts, search indexes, public caches, analytics, or logs. An unpublished commit produced during a failed compare-and-swap may exist as a local unreachable Git object: it must not become readable through the historical-version API or exported by a future synchronization operation. A future Git export must explicitly audit object reachability and private-data policy.

## Concurrency and recovery

- A shared filesystem lock covers draft read-modify-write across cooperating store instances. Draft revision tokens reject stale tabs.
- Canonical update uses Git `update-ref` compare-and-swap; a write racing after preparation cannot overwrite the winner.
- Unexpected process termination may leave the lock directory. Never automatically delete it based only on elapsed time; establish owner inactivity before recovery.
- Filesystem rename gives atomic visibility, not a claim of power-loss durability. Crash recovery, backups, disk-full handling, and postcommit cleanup/refresh uncertainty require dedicated production tests.
- Remote writers, multiple hosts, or network filesystems are not covered by the local-directory lock. Define the authoritative writer and an import/conflict protocol before enabling them.

## Independent tests

Run `node --test tests/security-review.test.mjs` from the project root. The suite uses disposable local data directories, real local Git operations, and direct HTTP-handler requests. It does not open a browser, use external services, or establish network/browser security acceptance.

Independent review execution: **17/17 passed** on 2026-10-21. Coverage: draft exclusion from canonical Git objects/history; invalid page paths and action names; unsafe source forms; stale and concurrent draft writes; a late canonical-ref race; restore-as-new-commit; rejection of unreachable history; exact Host/Origin for sensitive reads; denied static traversal; malformed requests and content-type checks; server-enforced read-only mode; actual v7 protected text byte preservation and restore; rejected injection and prefix/suffix drift. Retained draft base revision, stale flag, and matches-published status are checked. See tests/security-review-results.txt.

UI lifecycle review also inspected and ran the author’s 16 tests, including deterministic successful publish/restore followed by read failure: the successful revision receipt remains available, refresh failure is separate, and repeat writes are blocked until reconciliation. Unknown write outcomes also block blind retry. These are logic/static tests, not real-browser evidence.

One ordinary installed Chromium launch was attempted with Playwright chromiumSandbox:true after loopback HTTP became available. It failed before any page with process_singleton_posix.cc:297, socket() failed: Operation not permitted, SIGABRT. No retry with weakened flags was made. Actual DOM screenshots, browser focus, and native IME acceptance remain unverified. Loopback HTTP success does not establish browser availability or authentication.

## Before any public or production exposure

Do not release until all of these are implemented and verified against the actual deployment:

1. Administrator identity, session lifecycle, authorization on every read/write/history/preview path, CSRF protection, HTTPS, and audit attribution.
2. Least-privilege filesystem/service permissions, secret management, no arbitrary Git command capability, explicit remote synchronization authorization.
3. A safe bounded source-edit model and isolated build/preview environment with no credential or network access inherited from the administrator service.
4. Immutable build outputs, content/link validation, atomic deployment, and a failed-build policy that keeps the previous live site.
5. Backup/restore drills, stale-lock recovery, crash/disk-full testing, reconciliation of uncertain write outcomes, and concurrent-writer coverage for the actual storage topology.
6. Native-browser tests for navigation races, cancel/close, keyboard, IME, focus, read-only mode, conflict recovery, and refresh-after-commit failure; accessibility and responsive review.
7. Verified draft/history privacy through the real proxy, caching, search, logging, and export paths.

Passing focused prototype tests does not clear these production gates. No production changes, remote pushes, credentials, or browser-security workarounds are part of this review.
