---
slug: /
sidebar_position: 1
---
# Eve of Destruction modding knowledge

Subsystem-indexed technical references for LLM-assisted modding: engine, models, terrain, cars, physics, HUD, GUI and menus. Use source paths, executable revision and evidence labels before applying a change.

## Machine retrieval

- [knowledge-index.json](pathname:///testdriveeveofdestructionwiki/knowledge-index.json): filterable records with stable IDs, category/subcategory, tags, platform, evidence, source revision/path/hash, canonical/raw URLs, address mentions and dependency extraction status.
- [llms.txt](pathname:///testdriveeveofdestructionwiki/llms.txt): retrieval entry point.
- [llms-full.txt](pathname:///testdriveeveofdestructionwiki/llms-full.txt): complete sanitized technical Markdown corpus.
- Individual raw Markdown: `/testdriveeveofdestructionwiki/raw/{id}.md`.
- [Tags](tags): browse subsystem and evidence tags.

Example index filters with `jq`:

```sh
jq '.entries[] | select(.category == "cars")' knowledge-index.json
jq '.entries[] | select(.tags | index("historical"))' knowledge-index.json
jq '.entries[] | select(.platform | startswith("PS2"))' knowledge-index.json
```

## Evidence contract

[Battle recovery](ps2/BATTLE_RECOVERY.md) contains the current native weapon contract and validation limits. [Native weapon tests](native/native-weapon-tests.md) and [native AI research](native/native-ai-research.md) provide supporting evidence. CPU tests and static disassembly do not establish rendered gameplay success.

Historical and cross-platform references retain research leads and proposals; conflicting claims require revalidation. PS2 addresses must not be reused as Xbox addresses. Index address strings are lexical mentions, not verified function symbols. Empty dependency lists mean dependencies have not been extracted. Source-reported validation is not independently rerun by the documentation importer.

Only technical Markdown is imported. Conversation inventories, session identifiers and orchestration handoffs are excluded. Sanitization removes investigator names and session metadata from imported prose; original source hashes refer to the unmodified source bytes. The source checkout remains authoritative for exact local artifact paths.
