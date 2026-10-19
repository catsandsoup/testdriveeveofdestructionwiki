# Test Drive: Eve of Destruction technical knowledge

Docusaurus **2.4.3** site for public, evidence-backed technical documentation. No custom theme or styling.

Site: https://catsandsoup.github.io/testdriveeveofdestructionwiki/

## Develop and build

Use Node 22 (`nvm use`):

```sh
npm ci
npm start
npm run build
npm run serve
```

The production build checks site and Markdown links. Dependencies are locked in `package-lock.json`; Docusaurus 2.4.3 retains its React 17 / MDX 1 stack.

## Refresh imported knowledge

Source paths default to sibling checkouts `../eod-recomp` and `../TDEOD RECOMP`. Override with flags or `EOD_PS2_SOURCE` and `EOD_RESEARCH_SOURCE`:

```sh
python3 scripts/import-knowledge.py --ps2 /path/to/eod-recomp --research '/path/to/TDEOD RECOMP'
npm run build
```

Review the diff, manifest, citations, platform labels, evidence statements, and raw corpus after every refresh. The importer records repository revision, relative source path, dirty state, and SHA-256 of original source bytes. Personal handoff reports and unverified gameplay specifications are excluded. `docs/ps2/BATTLE_RECOVERY.md` is maintained independently and is never overwritten by import.

Read [CONTRIBUTING.md](CONTRIBUTING.md) for evidence requirements and [DOCUMENTATION_HANDOFF.md](DOCUMENTATION_HANDOFF.md) for the repeatable corpus refresh workflow.

## Deployment

`.github/workflows/pages.yml` builds pull requests and deploys successful `main` builds to GitHub Pages. Repository Pages settings must use GitHub Actions.
