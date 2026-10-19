# Association home and learning redesign

Baseline: `f79d9c46654a2e566f26edd556d474c76bdbd6a6`. Local feature work only; no push, deployment, production-domain change, CMS installation or WordPress migration.

## Delivered paths

- `/`: association identity, retained 2026 conference archive hero, learning/research/conference task entries, three-part learning journey, archive access, existing three-column people directory, contact and contribution paths.
- `/learn/map`: automatically generated complete topic tree across 127 existing Markdown pages. Native disclosure controls, nested outlines and session-local expansion persistence. Unique basename intentionally avoids the existing Nólëbase duplicate-index resolution defect.
- `/learn/try`: terminal input, six-sensor walkthrough and links to the existing detailed TS tutorial. Distinguishes input echoes, inference, prior knowledge, world steps and actual reasoning; Java material remains explicitly historical/unverified in this environment.
- `/learn/projects`: separates user purpose, maintainer attribution, inference core, runtime integration and inspired work. Does not merge NARS cores or declare all Java repositories applications.
- `/contact/`: dated link to the original 2026-05-14 research/admissions notice, without claiming current places or deadlines.
- `/about/home-archive`: exact old homepage body, clearly labelled historical.

## Historical content changes

No pre-existing Markdown or content asset deleted; every old Markdown URL builds. The only edited historical content files are:

1. `content/index.md`: reorganized homepage; complete former body retained in the archive; original member biographies remain in source and rendered directory.
2. `content/research/nars/theory/learning_resources.md`: wrong implementation link corrected, empty TODO heading removed.
3. `content/wiki/index.md`: removes stale numeric implementation summary and contradictory TS status; points to project-owned facts and new learning routes.
4. `content/contact/index.md`: adds dated original-notice entry and its scope boundary.

`content-inventory.json` records before/after SHA-256 for every historical file and hashes of additions. `content-diff.patch` is the complete content patch. To inspect an original, use `git show f79d9c4:path/to/file`; restore only the intended file when deliberately reverting.

## Verified

- Root-base preview production build, 147 HTML files.
- Content links: 145 Markdown files and built assets.
- `learning-content-retention.test.mjs`: 174 historical content files, four explicit edits, exact old-home archive, all old routes, 127 map pages, 272 selected internal links/anchors, eight named association people, TS status and implementation-link correction.
- `research-preview.test.mjs`: historical manifest remains unchanged; authorized editorial changes checked against the fixed baseline, 33/33 content assets byte-identical, curated-source and route checks.
- `research-interactions.test.mjs`: 15 deterministic news/history/state checks.
- Wikilink plugin unit test.
- `git diff --check`.

## Browser verification gap

A real Chromium test is provided in `tests/knowledge-map.spec.mjs`, including keyboard Enter/Space, nested disclosure, route/back restoration, 390px layout, light/dark screenshots, home people columns and separate news. It did **not** run successfully here: Chromium launch was blocked by the execution runtime (socket creation denied; the requested escalated execution also failed during sandbox setup). No browser, touch, mobile geometry, screen-reader or screenshot pass is claimed. Review the rendered UI in a supported browser before publication; source/SSR checks cannot replace this gate.

## Remaining boundaries

- Known existing GTI chapter 6.2 wikilink warning remains; no unrelated theory text was removed to suppress it.
- The original duplicate-basename resolver is not repaired globally. This iteration avoids adding an `index.md` and compares original rendered links to an independently built f79 baseline.
- WordPress exports, historical posts/media inventory, legacy query-address redirects, `/wiki/` path semantics and comment-thread mapping still require a migration decision. `/news` remains a selected research feed.
- No future conference date, registration system, current admissions place, email address or web-editor capability was fabricated.

Final rendered-content comparison also passed with the independently rebuilt f79 dist: 136 non-edited historical pages retain exact body text and link targets; six old homepage sections remain in the archive; original home links resolve to the same destination (local heading links now belong to the archived page); six biographies, four secretariat entries and 25 members remain; five news entries stay on the separate news page. The earlier run against an older 418 artifact was unsuitable as a current baseline and was replaced with the exact f79 source rebuild, not an exception list.
