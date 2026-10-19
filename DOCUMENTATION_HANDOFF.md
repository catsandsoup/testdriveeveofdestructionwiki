# Documentation maintenance handoff

This is a public technical knowledge corpus for all contributors and LLM-based documentation helpers. Continue documenting implementation findings, format knowledge, experiments, and citations. Do not add personal workflow language, chat/conversation names, investigator identities, private absolute paths, personal priority lists, session summaries, or game binary assets. Keep the existing Docusaurus 2.4.3 toolchain.

## Stable structure and retrieval

- Put platform-specific evidence under `docs/ps2/`, `docs/xbox/`, `docs/recomp/`, or `docs/native/`; put cross-platform comparisons under `docs/research/` and label each platform claim. Within each, use stable subsystem pages (engine/rendering, input, cars/AI, physics, terrain, models/formats, HUD/menus, platform/build).
- Preserve descriptive page IDs and filenames after publication. Rename only when the old route is kept as a redirect or all links and index records are updated together.
- `knowledge-manifest.json` records source inputs. The generated `static/knowledge-index.json`, `static/raw/`, `static/llms.txt`, `static/llms-full.txt`, and `sidebars.js` are machine retrieval outputs; do not hand-edit them.
- Platform, executable revision, evidence level, source revision/hash, citation, and dependency status must remain explicit. Address strings are candidates unless function identity was established independently. Empty dependencies mean “not extracted.”

## Refresh and review

From the wiki checkout, use Node 22 and Python 3. The default source locations are relative sibling checkouts and can be replaced with flags or environment variables:

```sh
nvm use
npm ci
python3 scripts/import-knowledge.py --ps2 /path/to/eod-recomp --research '/path/to/TDEOD RECOMP'
npm run build
```

Equivalent environment variables are `EOD_PS2_SOURCE` and `EOD_RESEARCH_SOURCE`; command-line paths take precedence. Inspect `git diff --check`, `git status --short`, generated manifest and raw corpus after import. Confirm source hashes, platform labels, links, and evidence claims. Search published files for names of tools/people, absolute paths, and accidental binaries before committing. The importer excludes planning pages, stale technical reports, and unverified gameplay specifications; it never overwrites `docs/ps2/BATTLE_RECOVERY.md`.

The source workflow is intentionally evidence preserving: it records source repository revision, relative source path, dirty state, and SHA-256 of original bytes. Sanitized prose is not a substitute for checking the referenced source. Keep direct external citations near the claims they support and pin mutable sources to a commit or release where practical.
