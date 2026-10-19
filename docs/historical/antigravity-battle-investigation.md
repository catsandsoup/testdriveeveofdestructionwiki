# Antigravity battle-mod recovery and approval brief


:::note Source and evidence
Historical investigation inventory; claims require revalidation. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `outputs/antigravity-battle-investigation.md` in `investigation session`. Repository HEAD: `session working notes`. Working-copy modifications: `yes`. Source SHA-256: `d815ab4f0083d4682bdf7dba2cb96d1273134e153eaad7ab12c9c2195ef6bff6`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


Investigated 19 October 2026, Australia/Sydney. Read-only investigation of source repositories and Antigravity records; no game source edits, commits, builds, deployments or agent restarts performed.

## Player outcome to approve

1. Battle chickens behave like the native two-player Battle weapon: direct forward shots, visible chicken models and explosions, correct damage, L2 firing with continued turbo while held, recharge permitted after release. The earlier user message explicitly preferred this over the feat/cheat mortar arc.
2. Single-player opponents move and compete like players: purposeful driving, pursuit/interception, shooting, aggressive demolition, recovery from obstacles, and appropriate racing/navigation where the selected battle map requires it.
3. Local multiplayer Battle retains independent human controls and adds bots to unused slots: 1 human + 3 bots, 2 + 2, 3 + 1, and 4 humans + 0 bots within the current four-participant design.
4. Countdown, respawn, scoring, match completion and replay remain functional. Stock modes and mod-off behavior remain usable.

Evidence required: native two-player weapon baseline; matched projectile traces and rendered sequences for the mod; scripted independent human controls; bot movement, firing, damage and recovery telemetry; full matches through finish/scoreboard and restart. Build/unit tests support this evidence but cannot replace gameplay verification.

## Chats and repositories

- Exact screenshot chat: **Tdeod Engine Recompilation Scoping**, `a3989b23-7955-4980-ac08-0f84eb9665be`.
- Gameplay implementation chat: **EOD Recomp Cheat and Mod Customization**, `abcf7fca-786b-40eb-af4c-3995aa0990aa`.
- Research/wiki repository: `/Users/monty/Documents/GitHub/TDEOD RECOMP`, branch `bringup`. No tracked edits observed; `.agents` symlink and `build-watch/` untracked.
- Playable PS2 recompilation: `/Users/monty/Documents/GitHub/eod-recomp`, branch `main`, HEAD `67c972b` (same as locally recorded `origin/main`; remote was not fetched).
- Existing uncommitted change: `src/game_patches.cpp`, 287 added / 37 removed lines. This investigation preserved it.
- The research repository's `.agents` points into `eod-recomp/.agents`, explaining the crossover between the two projects.

Recovered **42 descendant chats** belonging to the two relevant conversations: **9 scoping/research descendants and 33 gameplay descendants**. Also found one older prior-art researcher under **Test Drive Eve Recompilation**; listed separately below.

## What is actually unfinished

### Chicken weapon

The saved report describes a real crash caused by treating the wrong engine object as a weapon, leading to `PhobList: removing unknown phob` and an indirect call to zero. The committed fix removed AI weapon calls. The newer uncommitted patch attempts to restore them through `get_car_weapon()` / `create_car_weapon()`.

Static inspection exposes unresolved native-interface mismatches:

- `create_car_weapon()` writes the **car pointer** into weapon offset `+488`. Native `f_0017EC58()` passes that field to `f_00179A08()` (the participant-to-car accessor). This requires tracing the native registration contract; pointer-versus-participant confusion remains a serious candidate defect.
- Calls labelled “fire” invoke `f_0017E5C8()`. Its generated body performs lifecycle/reload/update work and only conditionally invokes `f_0017EC58()` on a rain-cheat branch. The name/comments and mocked tests do not establish a valid native Battle firing path.
- The patch still sets combined cheat flags `0x19`. The source comment calls this forward firing, but that comment is not trajectory evidence. The conflict between feat mode and Battle mode must be resolved against the native two-player baseline.
- One static `s_player_l2_held` variable is shared by all driver invocations; multiplayer needs per-human button/recharge state.

The actual launch angle, speed, gravity and render lifecycle have **not** been measured in this investigation. They are the first decisive tests after approval.

### Single-player battle AI

There are two overlapping implementations: the new `run_ai_vehicle_combat()` in the human-driver hook, and the older vblank AI block. Both contain direct pursuit, sliding and reverse logic. They must become one coherent controller with explicit match lifecycle handling.

The old block is gated on `BattleMaster + 4 == 1`; historical worker instructions flag that assumption as the reason cars remained stationary. This is a historical diagnosis to verify, not a freshly reproduced conclusion. The new hook bypasses that block but has no equivalent explicit countdown/finish guard.

Current logic is mainly nearest-opponent pursuit with velocity lead and reverse-on-stall. It does not establish obstacle-aware racing/navigation or tactical human-like behavior. A hardcoded circle around world origin clamps all cars to roughly 24 metres; that is not map-aware navigation and may interfere with driving on different arenas/tracks.

### Multiplayer battle bots

The current human-driver hook uses `car != player_car` to identify AI. That classifies **players 2–4 as bots** in Battle and skips their normal human-driver update. This is directly visible in the source and must be fixed before multiplayer is accepted.

The older vblank loop reads the number of human players and iterates remaining slots, but a loop is not proof that the full spawn/controller/weapon/score/respawn lifecycle supports those bots. All four player/bot combinations need real runs.

### Why earlier “complete” reports are insufficient

- The historical report claims 49/49 tests and a 6,000-frame match, but also explicitly says AI firing was removed.
- Later user messages report stationary opponents, invisible chickens/explosions and wrong shot arcs.
- The battle stress harness replaces native weapon lookup and firing with mock functions that count calls. Those checks cannot validate native weapon allocation, projectile trajectories or rendering.
- Teamwork's `PROJECT.md` still records M_TEST as IN_PROGRESS and M_FINAL as PLANNED. The planned `tools/test_battle_configurations.sh` was not found; its test worker has only an initial progress log.
- The newest repair coordinator reports an infrastructure timeout. The main chat ends inspecting cheat bits and the old AI block, without a verified completion report for the current patch.

## Proposed implementation sequence

1. Preserve the existing patch and establish a repeatable, headless/muted native two-player Battle baseline. Trace actual weapon registration, ownership, fire/reload functions and projectile setup.
2. Repair the chicken path to match that baseline, including visible model/explosion, damage, L2 turbo coexistence and independent per-player recharge state.
3. Consolidate bot control; correctly identify humans versus bots; verify match states and reset state on restart/respawn. Add purposeful driving, navigation/recovery and aggressive shooting/ramming with measured outcomes.
4. Complete local multiplayer bot allocation and lifecycle for 1+3, 2+2, 3+1, 4+0; prove human controls are never intercepted as bot controls.
5. Run current build/regressions plus actual rendered battle matches, weapon comparisons, feature combinations, finishes and restarts. Update documentation to distinguish observed behavior from plans.

No unrelated custom game modes, renderer overhauls or online-network multiplayer are included in this approval scope. The historical multiplayer work is local split-screen; network multiplayer would require a separate scope.

## Full subagent inventory

Names below come from recorded spawn roles. “Stopped” reflects Antigravity's saved killed flag and transcript ending, not proof that no partial work exists. All records were idle in the summary snapshot. Earlier successful reports remain historical claims unless independently checked above.

### Tdeod Engine Recompilation Scoping

| Chat ID | Role | Assignment | Last known outcome | Parent |
|---|---|---|---|---|
| `77d10335-4418-43fa-8ae3-234090dd1b9b` | Engine Reverse Engineer & Scoping Specialist | Whole-engine scoping coordinator: maps, physics, vehicles, graphics, AI, event injection and wiki. | Worker report returned; improvement worker timed out. | `a3989b23` |
| `d3d63268-3b21-4e2e-999b-2733721d109f` | Deep Investigator Worker L0 | Detailed engine/asset reverse engineering; 15 mode blueprints and five engine overhauls. | Substantial report delivered; specifications are not implemented modes. | `77d10335` |
| `fe5a6632-aa45-46dc-a3f7-6637d117ce2c` | Physics, Vehicles & Collision Hooks Reverse Engineer | Physics, collisions, vehicle constraints, detachment and mod hooks. | Delegated to physics worker; no final findings found. | `a3989b23` |
| `b15101c6-911d-4b7e-afef-0ccd8b097d6e` | Track Geometry, Maps & Destructibles Reverse Engineer | Track formats, geometry, scenery, destructibles, debris and hub-world architecture. | Delegated to map worker; no final findings found. | `a3989b23` |
| `90164e2c-39da-4d60-9bed-7bf7ac95d454` | AI Logic, Event Injection & Wiki Architect | AI pathfinding, combat state machines, participant allocation, event injection and wiki. | Delegated; last response was waiting for worker. | `a3989b23` |
| `29a9a21c-0100-446a-9e76-c3239abfae0b` | Layer 0 Investigator | Map/destructible investigation worker. | Stopped; no final handoff found. | `b15101c6` |
| `c2df1172-9d92-4915-8575-1cc49f098e47` | Deep Investigator Worker | AI/event/wiki investigation worker. | Stopped; no final handoff found. | `90164e2c` |
| `dfe87bec-e1fc-4f9f-b017-fa29142fb0af` | Physics Engine Investigator | Physics worker for collision, mass, traction, weapons and constraints. | Stopped; no final handoff found. | `fe5a6632` |
| `9053c74c-494f-4b37-a27e-0c4616475933` | Deep Investigator Improvement Worker | Review and improve the broad scoping report. | Coordinator reports execution/network timeout; no completed synthesis found. | `77d10335` |

### EOD Recomp Cheat and Mod Customization

| Chat ID | Role | Assignment | Last known outcome | Parent |
|---|---|---|---|---|
| `5f0e88f1-68b6-44e7-8a4e-9b6116974509` | EoD Gameplay Reverse Engineer | Initial gameplay reverse-engineering coordinator. | Delegated; no final report found. | `abcf7fca` |
| `f8dabd4a-cafd-4067-8e92-333a495f6b28` | Layer 0 Investigation Worker | Initial feats, weapons and battle investigation. | Stopped; no final handoff found. | `5f0e88f1` |
| `9ba44578-2f29-4759-a464-9c1648529555` | EoD Gameplay Mods Teamwork System | First gameplay teamwork coordinator. | Reached survey phase; stopped. | `abcf7fca` |
| `97c356d9-cd24-4cac-a55d-1e6ff3d90dcb` | Project Orchestrator | First survey orchestrator. | Dispatched feats, turbo/weapons and battle explorers; stopped. | `9ba44578` |
| `02d1d68f-02d4-48b2-8001-0de370b9b845` | Feats Cheats Explorer | Feats/cheats bitmasks, unlocks and VALT tables. | Stopped during survey. | `97c356d9` |
| `6da292cb-7826-4a03-a00f-686abb318264` | Turbo Weapons Explorer | Turbo speed/acceleration and chicken blast force/radius. | Stopped during survey. | `97c356d9` |
| `d39ac0a8-5dbd-46a2-a67e-81bc59849c25` | Battle Mode AI Explorer | Single-player battle menus, solo boot and AI combat. | Stopped during survey. | `97c356d9` |
| `dd795337-5230-454f-891c-7914643edbf2` | DeepCoder Mod Implementation Engineer | Gameplay implementation coordinator: menus, live cheats, UI and later aggressive bots. | Earlier work reported complete; later battle task delegated and stopped. | `abcf7fca` |
| `16d14602-4b62-4238-af19-437c9120664a` | Coding Worker L0 | Missing Battle event selection, unlock all feats, in-game mod settings. | Stopped; no final standalone response found. | `dd795337` |
| `2151623c-482f-4bef-847f-b70f209e57b2` | Coding Worker L0 | Live controller-only cheat toggles, bypassing quit-to-menu flow, defaults and menus. | Implementation/verification report delivered. | `dd795337` |
| `88bba760-ec2a-4ff7-8dbc-75171b87651b` | DeepCoderImprovementWorker | Review controller chords, input bleed-through, menu collisions, haptics and audio. | Reported fixes and 49/49 tests; historical claim. | `dd795337` |
| `bf380e7a-3025-4e97-9715-37f70a83e419` | Coding Worker L0 | Feature matrix/screenshots plus aggressive pursuit, recovery and chicken shooting. | Stopped; last responses were waiting. | `dd795337` |
| `6f6f52fa-3366-4e9c-b309-4f41f2e3b6cf` | Teamwork Multi-Agent Coordinator | Second teamwork coordinator for single-player and multiplayer bots. | Reported core review passed, launched tests/docs; stopped before final acceptance. | `abcf7fca` |
| `f936bf37-e394-4d1b-81b5-5e6def8c08f0` | Project Orchestrator | Orchestrated M_CORE, M_TEST, M_DOCS and review gates. | M_CORE marked passed; test worker unfinished and final acceptance not reached. | `6f6f52fa` |
| `0fb1fd8b-eecc-4fed-8daf-01418f3369e8` | Menu & Map Explorer | Battle carousel, solo boot, arena maps and bounding. | Survey handoff delivered. | `f936bf37` |
| `b0453476-9ffb-457e-95fe-ea99b38408a8` | AI & Bot Scaling Explorer | AI driving, weapon calls, bot scaling and finish arbitration. | Survey handoff delivered; some assumptions need revalidation. | `f936bf37` |
| `86e20130-cb25-488e-bfb4-02f3d504a4ef` | Test & Docs Spec Miner | Build/test automation, controller scripts, configurations and visual evidence. | Survey handoff delivered. | `f936bf37` |
| `dfbd370f-9f58-4b45-be7d-da9101f60db3` | M_CORE Implementer | Core menu injection, pursuit, ram/sliding, recovery, shooting, bot scaling and arena limits. | Code/handoff delivered; shooting later removed after crash and gameplay defects reported. | `f936bf37` |
| `530fde50-c718-479a-bcb4-71e5933cc14d` | M_CORE Reviewer 1 | Independent M_CORE review 1. | APPROVE reported on earlier implementation, not the current patch. | `f936bf37` |
| `e6b7076d-55e0-4089-9315-72695215ed2a` | M_CORE Reviewer 2 | Independent M_CORE review 2. | APPROVE reported on earlier implementation, not the current patch. | `f936bf37` |
| `382f8aed-68ef-400a-ac57-4660dc335c43` | M_CORE Challenger 1 | Adversarial core math/edge cases: pursuit, unstick, firing ranges and bot slots. | CONFIRMED_CORRECT reported; native gameplay remained unproven. | `f936bf37` |
| `61721c7b-398e-48ec-9e49-6261ff0382e0` | M_CORE Challenger 2 | Stress harness for bot counts, finish/ranking, bounds and firing conditions. | 23 oracles reported; engine weapon routines are mocked in harness. | `f936bf37` |
| `dbd0c8ae-10b2-4c4d-b3c9-0e01bae9445b` | M_CORE Forensic Auditor | Forensic audit of implementation and test integrity. | CLEAN reported; predates later real-game failure reports. | `f936bf37` |
| `06897f5c-d2e5-4087-8d03-69122fdd64e9` | M_TEST Implementer | Stock/all-enabled/turbo/chickens/chaos matrix and PNG captures. | Progress log only; no finished handoff or planned test script found. | `f936bf37` |
| `3fea9280-5b9d-4139-83c9-0f6b3fe069a8` | M_DOCS Technical Writer | Technical/player documentation for battle, AI, cheats and validation. | Documentation handoff delivered; some statements now stale. | `f936bf37` |
| `bb8f3db2-6143-4a76-aa4a-b792105ff9cd` | DeepCoder Mod Implementation Engineer | Latest repair coordinator for stationary bots and mortar versus Battle chicken. | Three worker attempts; latest ended in infrastructure timeout. | `abcf7fca` |
| `46df5806-c747-4d0a-ad65-985edf153341` | Coding Worker L0 | Stationary bots, invisible chickens/explosions and wrong trajectory. | Stopped; no final standalone handoff found. | `bb8f3db2` |
| `4875c3d8-59c4-46e4-972f-c7411201c0b4` | Coding Worker L0 | Match native two-player straight chicken and L2 turbo/recharge behavior. | Stopped; no final standalone handoff found. | `bb8f3db2` |
| `09e7bc75-dbda-4955-8ed2-4692fa7972a0` | Battle Mode Weapon Physics Investigator | Native Battle versus feat weapon kinematics, rendering and L2 behavior. | Delegated; stopped before final findings. | `abcf7fca` |
| `490b460f-3382-4de5-9f41-e506378afa6b` | Single-Player Battle AI Controller Investigator | Stationary AI: controller type, overwritten inputs and BattleMaster state gate. | Delegated; stopped before final findings. | `abcf7fca` |
| `2212316e-93ac-4d6c-8bd3-48d703fac350` | Investigation Worker L0 | Battle AI/controller investigation worker. | Stopped; no final handoff found. | `490b460f` |
| `8690bb06-ef09-4672-9149-5c9808402e3d` | Layer 0 Investigation Worker | Weapon-physics investigation worker. | Stopped; no final handoff found. | `09e7bc75` |
| `1585889a-76e7-4d4a-bf04-6fdf30a9eaf1` | Coding Worker L0 | Retry the same straight-chicken and moving-bot repair. | Timed out while looking for gameplay validation scripts; no verified completion. | `bb8f3db2` |

### Earlier related research

`87ca8470-6e6d-4b0b-a501-11c2ab99519d` — **Prior-art researcher**, under **Test Drive Eve Recompilation** (`a46dfd05-…`). Investigated prior recomp projects, RoadTripAdventure/PS2Recomp, Apple Silicon rendering, licences, archive extraction and IOP support. Delivered a report; this is background research, not a pending battle implementation worker.

## Evidence locations

- Chat index and parent relationships: `/Users/monty/.gemini/antigravity/conversation_summaries.db`.
- Individual chat storage: `/Users/monty/.gemini/antigravity/conversations/<full-chat-id>.db`.
- Readable transcripts: `/Users/monty/.gemini/antigravity/brain/<full-chat-id>/.system_generated/logs/transcript.jsonl`.
- Historical implementation/verification report: `/Users/monty/.gemini/antigravity/brain/abcf7fca-786b-40eb-af4c-3995aa0990aa/gameplay_mods_verification.md`.
- Teamwork milestones and handoffs: `/Users/monty/Documents/GitHub/eod-recomp/.agents/teamwork/`.
- Existing code: `/Users/monty/Documents/GitHub/eod-recomp/src/game_patches.cpp` (weapon helpers at 273/287; AI at 325; human/bot classification at 488; shared L2 state at 513; cheat mask at 884; old battle loop at 893; state gate at 975).
- Native generated reference: `eod-recomp/gen/rec_020.c:6609` (`f_0017DFA8`), `gen/rec_021.c:396` (`f_0017E5C8`) and `gen/rec_021.c:827` (`f_0017EC58`).
- Mock weapon functions: `eod-recomp/tools/tests/battle_core_stress_test.cpp:137` and `:148`.

## STAR handoff

**Situation:** Antigravity split this work across a research repository and the playable PS2 recompilation, with numerous stopped workers and completion claims predating user-reported gameplay failures.

**Task:** Recover all related work and prepare an approval scope centred on native Battle chicken behavior, effective single-player combat AI, and multiplayer bots.

**Action:** Read the local chat index, decoded conversation records, inspected worker assignments and outcomes, compared existing source changes with HEAD, and checked native generated code plus test limitations. Preserved repository state.

**Result:** Located the exact screenshot chat, related gameplay chat, all 42 descendants, and the unfinished uncommitted patch. Concrete multiplayer ownership and state-management issues are identified. No claim is made that the current code builds or that the mods now work; no new game run was performed.

**Next decisive test after approval:** Capture an unmodified two-player Battle firing/boost/recharge sequence, instrument native weapon ownership and projectile state, then compare the same inputs with the existing mod. This establishes the correct weapon contract before repairing the bot integration.
