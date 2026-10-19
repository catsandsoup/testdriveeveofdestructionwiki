---
slug: /
sidebar_position: 1
title: Eve of Destruction Wiki
hide_table_of_contents: true
---

import TdeodHub from '@site/src/components/TdeodHub';
import PS2Button from '@site/src/components/PS2Button';

<TdeodHub />

---

## Technical Knowledge & Subsystems

Subsystem-indexed technical references for *Test Drive: Eve of Destruction* and its native PlayStation 2 recompilation (`SLUS_209.10`). Filter by platform, executable revision, subsystem, and evidence strength before applying a finding. PS2 recompilation and host-platform behavior must be established independently. Xbox research remains deferred as historical background.

### Evidence Contract

- **[Battle recovery](ps2/BATTLE_RECOVERY.md)** documents current native weapon findings and validation limits. Static analysis and synthetic CPU tests do not establish rendered gameplay behavior.
- **[Experimental Battle navigation](ps2/BATTLE_NAVIGATION.md)** records the bounded primary-course policy, native contracts, and per-track acceptance gaps; it does not claim general obstacle avoidance.
- Historical and cross-platform references retain research leads and proposals; conflicting claims require revalidation. PS2 addresses must not be reused as Xbox addresses.
- Index address strings are lexical mentions, not verified function symbols. Empty dependency lists mean dependencies have not been extracted.
- Source-reported validation is not independently rerun by the documentation importer.
- Claims identify their platform, source revision, and evidence limits. Source hashes refer to original input bytes; source paths are relative to their repository.

:::note Target Architecture: PlayStation 2 (SLUS_209.10)
All reverse engineering and decompilation efforts are focused on the **Sony PlayStation 2 NTSC-U** release (`SLUS_209.10`). Emotion Engine MIPS R5900 execution, Graphics Synthesizer (GS) primitive pipelines, Vector Units (VU0/VU1), IOP controller polling, and SPU2 sound synthesizers represent the canonical architecture.
:::
