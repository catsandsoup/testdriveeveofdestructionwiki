# Documentation maintenance handoff

This is a public technical knowledge corpus for all contributors and LLM-based documentation helpers. Continue documenting implementation findings, format knowledge, experiments, and citations. Keep the corpus focused on reusable technical findings. Exclude private coordination details, personal plans, private absolute paths, and game binary assets. Keep the existing Docusaurus 2.4.3 toolchain.

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

The importer refuses to modify outputs if either source documentation directory is missing or empty. Do not bypass this check to produce a partial corpus.

Equivalent environment variables are `EOD_PS2_SOURCE` and `EOD_RESEARCH_SOURCE`; command-line paths take precedence. Inspect `git diff --check`, `git status --short`, generated manifest and raw corpus after import. Confirm source hashes, platform labels, links, and evidence claims. Search published files for names of tools/people, absolute paths, and accidental binaries before committing. The importer excludes planning pages, stale technical reports, and unverified gameplay specifications. Battle recovery refreshes from `eod-recomp/docs/BATTLE_RECOVERY.md` through the same source import and provenance checks.

The source workflow is intentionally evidence preserving: it records source repository revision, relative source path, dirty state, and SHA-256 of original bytes. Sanitized prose is not a substitute for checking the referenced source. Keep direct external citations near the claims they support and pin mutable sources to a commit or release where practical.

## Prompt for a documentation model

Use this as a standing task description, with source checkout paths supplied separately:

> Maintain the public Test Drive: Eve of Destruction technical knowledge corpus. Read CONTRIBUTING.md and this handoff. Review only changed technical sources since the last imported source hashes. Extract facts about engine interfaces, data formats, models, terrain, vehicles, physics, weapons, input, HUD, GUI and menus. Separate static findings, executed tests, observed gameplay, hypotheses and proposals. Cite the platform, executable build, address or source location and evidence. Preserve unresolved limits; do not turn plans or fixture tests into claims of working gameplay. Omit conversation history, people, repository-holder preferences and personal schedules. Update source documentation before importing when possible, run the documented sync and production build, inspect the diff and generated retrieval resources, and submit a small reviewable change through the repository's contribution workflow. If no technical evidence changed, make no commit. Stop when the change is complete. Escalate reverse-engineering uncertainty as an open technical question; do not guess an ABI, memory offset or result.

## Record shape for a new finding

- Stable topic and subsystem; affected platform and executable/revision.
- Claim stated narrowly enough to test.
- Evidence class: static inspection, native execution, boundary fixture, live observation, hypothesis, or proposal.
- Source path/address/commit or direct public citation; command/configuration for reproduction.
- Observed result, known limits, conflicting earlier claims and the next discriminating test.
- Dependencies and compatibility constraints; include units and guest-versus-host address distinctions.

When retiring an incorrect finding, retain a short correction route if it was published, remove the incorrect claim from the machine corpus, and link to its replacement. Check that the JSON index has exactly one record for each imported page, the raw Markdown matches that page, and the source hash matches the imported source bytes. `dependencies: []` currently means extraction has not been performed, not that the subsystem has no dependencies.

After an authorized push, verify the GitHub Actions deployment for that exact commit and fetch the changed public raw page and JSON record. A local production build does not prove the public deployment updated.

Toolchain references: [Docusaurus 2 deployment](https://docusaurus.io/docs/2.x/deployment) and [Docusaurus 2 docs plugin/front matter](https://docusaurus.io/docs/2.x/api/plugins/@docusaurus/plugin-content-docs). Keep the project URL and base path consistent with GitHub Pages when changing routing.
