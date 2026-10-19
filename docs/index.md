---
slug: /
sidebar_position: 1
---
# Test Drive: Eve of Destruction knowledge base

Technical documentation for the PS2 recompilation and related Xbox / cross-platform research. This site uses the default Docusaurus 2 appearance.

Start with [current Battle recovery](ps2/BATTLE_RECOVERY.md), [PS2 status](ps2/STATUS.md), and the [native weapon tests](native/native-weapon-tests.md). The Battle recovery chapter supersedes conflicting historical weapon and bot claims.

## How to read the evidence

- **PS2 implementation notes:** imported from `eod-recomp/docs`. Each page retains its source path, repository revision, working-copy status and source hash. A page is documentation, not proof that every feature works live.
- **Native investigations:** static/disassembly analysis and CPU test observations. Read test limitations before drawing gameplay conclusions.
- **Historical / cross-platform research:** imported from `TDEOD RECOMP/docs`. Some pages mix Xbox and PS2 addresses or describe aspirations as existing behavior. These claims require revalidation against the relevant executable and current implementation.
- **Historical investigation inventory:** an inventory of earlier agent findings, retained for traceability. Treat it as leads, not current validation.

## Reproducibility

Addresses must always be paired with the executable platform and revision named in the source. Preserve the difference between static evidence, verified CPU tests, live gameplay observations, and proposed behavior. Missing evidence means pending verification.

The repository's `knowledge-manifest.json` records the exact imported source hashes. `npm run sync:knowledge` refreshes the snapshot from local source checkouts; see the repository README for path overrides. No disc images, executables, generated recompilation sources, captures or binary assets are imported.
