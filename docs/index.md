---
slug: /
sidebar_position: 1
---
# Eve of Destruction technical knowledge

Subsystem-indexed technical references for *Test Drive: Eve of Destruction* and its recompilation. Filter by platform, executable revision, subsystem, and evidence strength before applying a finding. PS2, Xbox, recompilation, and host-platform behavior must be established independently.

## Machine retrieval

- [Structured knowledge index](pathname:///testdriveeveofdestructionwiki/knowledge-index.json): stable page IDs, platform/evidence labels, provenance, address candidates, and dependency status.
- [LLM retrieval entry point](pathname:///testdriveeveofdestructionwiki/llms.txt)
- [Complete Markdown corpus](pathname:///testdriveeveofdestructionwiki/llms-full.txt)
- Individual raw Markdown: `/testdriveeveofdestructionwiki/raw/{id}.md`.
- [Tags](tags): browse subsystem and evidence tags.

Example index filters with `jq`:

```sh
jq '.entries[] | select(.category == "cars")' knowledge-index.json
jq '.entries[] | select(.tags | index("historical"))' knowledge-index.json
jq '.entries[] | select(.platform | startswith("PS2"))' knowledge-index.json
```

## Evidence contract

[Battle recovery](ps2/BATTLE_RECOVERY.md) documents current native weapon findings and validation limits. Static analysis and synthetic CPU tests do not establish rendered gameplay behavior.

Historical and cross-platform references retain research leads and proposals; conflicting claims require revalidation. PS2 addresses must not be reused as Xbox addresses. Index address strings are lexical mentions, not verified function symbols. Empty dependency lists mean dependencies have not been extracted. Source-reported validation is not independently rerun by the documentation importer.

Claims identify their platform, source revision, and evidence limits. Source hashes refer to original input bytes; source paths are relative to their repository. Use the linked pages and machine index to retrieve findings by subsystem and evidence level.
