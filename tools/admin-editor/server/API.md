# Administrator text editing prototype API

Node 20+ and Git; no npm dependencies or scripts installed. Cloud-local prototype only. No user computer or upstream repository modified.

## Start

From `agi-online-editor-work`:

```sh
node server/cli.mjs init-demo ./local-editor-data
# Or use the pinned-site fixture in a different new directory:
node server/cli.mjs init-v7-fixture ./v7-editor-data
node server/cli.mjs serve ./local-editor-data 8787
```

Open `http://127.0.0.1:8787`. This requires a host able to bind sockets; HTTP handlers are independently testable without opening a port. The service deliberately binds loopback, not all interfaces. It is not suitable to expose publicly or behind a proxy as-is. There is no login, session management, administrator identity verification, roles, public editing, TLS, rate limiting or production audit actor attribution. No credentials are generated or saved.

## Shared contract

- GET `/api/pages`: `{pages:[{id,title,format}],revision,capabilities}`.
- POST `/api/action`, Content-Type `application/json`, exact matching Origin and Host. Body is `{action,...arguments}`.
- Errors: `{error:{code,message}}`; conflict 409, unauthorized origin/readonly 403, unknown resource 404. Internal errors omit raw filesystem/child-process details from response; service logs preserve them.
- `read {id}` → `{id,content,revision,draft}`. Draft is null or `{id,content,baseRevision,draftRevision,updatedAt,status,stale}`. `status:matches-published` only means equal text, not proof this draft caused a past publication. `stale` means base revision differs from current.
- `saveDraft {id,content,baseRevision,expectedDraftRevision}` → draft. Initial expectedDraftRevision must be null. Both current published revision and old draft revision must match. On conflict the caller retains input and compares, never silently retries overwrite.
- `preview {id}` → saved draft plus `format:plain-text,published:false`; UI must use text nodes, not raw HTML. This is NOT VitePress layout preview.
- `publish {id,expectedRevision,expectedDraftRevision}` → `{revision,publishedToWebsite:false,synced:false,draftRetained:true}`. The action creates a local canonical Git version ONLY. It does not build or deploy a website.
- `history {id}` → `{versions:[{revision,date,summary}]}`.
- `readVersion {id,targetRevision}` → `{id,content,revision}`. Only reachable canonical ancestors.
- `restore {id,targetRevision,expectedRevision}` → publication-shaped result; creates a new commit, never rewrites old history. The private draft remains.
- `syncStatus` → `{state:disabled,reason,localRevision,lastSyncedRevision:null}`. No push/pull operation exists. This is a truthful disabled integration boundary, not simulated synchronization.

## Storage and privacy

`content.git` is a dedicated bare Git repository, canonical ref `refs/heads/published`. No real site checkout is used. `private-drafts` and manifest are outside Git. Static HTTP exposes exactly four application files, never data directory, Git objects, draft files or manifests. New data root/private directory modes are owner-only on POSIX; pre-existing root permissions and host security remain operator responsibilities. Origin/Host checks mitigate browser cross-origin access; they are not authentication against another local process or OS user.

Global atomic mkdir lock coordinates cooperating store processes; Git `update-ref` compares expected old revision against all Git writers. Crashed process may leave `.write-lock`; operators must verify no writer remains before removing a stale lock. No automatic lock stealing. Git dangling prepared objects after failed CAS are harmless but not immediately garbage-collected. Private draft atomic rename is not a power-loss durability promise (no fsync). Initialization should use a fresh directory; incomplete initialization remains for inspection rather than silently replacing an existing store.

Only maintainer-allowlisted IDs are editable. Plain demo pages are never compiled. V7 fixture mapping exposes one trusted plain-text fragment: prefix/suffix remain opaque and must still match byte-for-byte. Editable text rejects markup/interpolation/control characters; this is a narrow text editor, not a general Markdown sanitizer. Retain user input when validation fails; styling belongs to the later structured editing phase. Any future VitePress build adapter must validate source policy and execute build in an appropriately isolated environment before advancing a live-release pointer. Local content approval must not be presented as live deployment.

## Boundaries not verified

Production login and permissions; live deployment/build gate; remote Git credentials/sync/divergence; full-source Markdown sanitization; media uploads; image licenses; live browser focus/IME/visual presentation; multi-machine shared filesystem behavior; crash/power-loss recovery. Tests exercise temporary real Git repositories and direct HTTP handler contracts, not a production server.
