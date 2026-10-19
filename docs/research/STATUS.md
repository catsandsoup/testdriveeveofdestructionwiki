# Bring-up Status & Handoff


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/STATUS.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `1663a0288c7d5fbe87006cea8daea7ed2f0f0c4b6b97a26438516c95dd8a5941`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


Living document: every session updates it before ending. Read GOALS.md
(§0 multiplayer pass requirement first), PRODUCT_RULES.md, then this.

## Working rules for agents

- **Headless and muted only** while the owner sleeps:
  `TDEOD_HEADLESS=1 RECOMP_MUTE=1`. Never open a window or play sound.
  Report progress with frame dumps/screenshots.
- Never commit disc data or anything derived from it (`game/`, `work/`,
  `save/`, `src/recomp/gen/` are ignored).
- Keep subagents short; chain fresh sessions sequentially off this file.
- Target: Apple M2 Pro (6P+4E). Guest code stays serialized by the guest lock
  (the Xbox had one CPU, and the game assumes it); parallelism comes from host
  work: Metal render thread, APU/audio thread, file I/O, FMV decode.

## Layout

| Path | What |
|---|---|
| `src/main.c` | host: maps XBE, kernel init, device switches, guest thread (QoS user-interactive), MCPX MMIO (APU/AC97/USB) |
| `src/recomp_manual.c` | hand-written overrides (native memmove for CRT `0x001690E0`) |
| `src/tdeod_oracle.c` | differential-oracle snapshots |
| `src/kernel, nv2a_gl, nv2a_metal, apu, usb, ...` | runtime from JSRF Unleashed / xboxrecomp (MIT + LGPL parts, see LICENSES/) |
| `tools/recomp` | the x86→C lifter (patched here, see below) |
| `tools/tdeod/regen.sh` | full pipeline: icall feedback → disasm → func_id → ABI → lift → patch |
| `tools/tdeod/patch_gen.py` | title hooks inserted into generated code after each regen |
| `tools/tdeod/oracle.py` | Unicorn x86 vs lifted-C differential oracle (wrap / replay) |
| `tools/tdeod/xdis.py` | disassemble a VA range / function of the XBE |
| `game/` | extracted disc (default.xbe + data/) — local only |
| `save/` | HDD partitions, `save/Cache` = Z: (game's cache + `heat.log`) |

Build & run (headless):

```sh
sh tools/tdeod/regen.sh            # only after lifter/manual changes
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j10
TDEOD_HEADLESS=1 RECOMP_MUTE=1 ./build/tdeod_recomp game 2> run.log
```

`save/Cache/heat.log` is Monster Games' own debug log ("Panic: ...") — an
excellent oracle for logic errors.

## Oracle workflow (finding miscompiled functions)

```sh
work/.venv/bin/python tools/tdeod/oracle.py wrap 0x00023BF0
cmake --build build -j10
tools/tdeod/oracle_run.sh 0x00023BF0 <skip-n-calls>      # capture + replay + diff
work/.venv/bin/python tools/tdeod/oracle.py unwrap
```
(`work/.venv` has unicorn 2.1.4 + capstone + pytest; recreate with
`python3 -m venv work/.venv && work/.venv/bin/pip install unicorn capstone pytest`.)
Noise to ignore in diffs: pushbuffer at 0x832056xx, D3D state 0x001DAxxx
(other threads run during the lifted call). `cpuid` values differ by design
(Unicorn reports the host CPU). Snapshots are now written page by page, so
unmapped contiguous pages no longer truncate them (a truncated snapshot made
every load from the missing tail "differ" -- the oracle now refuses one).
To find the call to compare, print the args at the generated function's entry
once (gen code is throwaway) and pick the skip count from that.

## Fixed so far (2026-10-16 session 1)

1. **Self-relaunch on cold boot**: the title calls `XLaunchNewImage` on itself
   when `XGetLaunchInfo` fails. Kernel bridge now persists the launch data page
   (`RECOMP_LAUNCH_DATA`) and `recomp_restart_self()` execs again.
2. **D3D fence spin** (0x001CE2F3): `xbox_Nv2aMirrorFence(0x001DAC98, 0x2C, 0x30)`.
3. **Runtime device switches** defaulted in main.c (USB, GL, PB_EXEC, VBLANK...).
4. **Thread IDs**: fake ETHREAD lacked `UniqueThread` (+0x12C) and
   `PsCreateSystemThreadEx` never returned ThreadId; the task scheduler span
   forever ("Current thread is unlisted"). Fixed in kernel_bridge.c +
   xbox_memory_layout.c.
5. **AC'97 reset bit** self-clears (DirectSound spin at 0x00185BA4).
6. **GP DSP doorbell** (0x0018037C) acknowledged via `mcpx_apu_dsp_ack_add`
   hook (patch_gen.py).
7. **CRT memmove 0x001690E0** replaced natively (lifted version lost its
   jump-table head/tail cases).
8. **Lifter: flag state across joins** — `_flag_states_compatible` required
   equal widths, so `test eax,eax / jmp` + `test bl,bl` → `je` used the
   never-set `_flags` fallback. Fixed in tools/recomp/translator.py; found via
   the oracle (eve loader: 17 eves vs 89).

## Fixed in session 2 (2026-10-16)

1. **APU/NV2A clock overflow**: `qemu_clock_get_us/ns` multiplied the host ns
   counter before dividing; it overflowed int64 after ~2.5 h (us) / 9 s (ns)
   of Mac uptime, so all APU frame pacing ran on garbage time.
2. **Port I/O lifted** (`in`/`out` -> `xbox_PortIn/xbox_PortOut`,
   kernel_hal.c). MCPX GPIO 0x80C0 bit 5 = TV field line, toggled per vblank.
   D3D's GPU ISR (0x001D1D28) reads it; **XMV starts a movie clock only on an
   even field** -- this was the logos.xmv stall. ACPI PM timer at 0x8008.
3. **NV2A PVIDEO**: STOP (0x8704) clears BUFFER (0x8700); pending buffers are
   consumed. The overlay disable after each movie spun forever otherwise.
   `g_nv2a_overlay_latch_fn` is the hook for actually showing movie frames.
4. **Translator: cmp/test flag joins** merged as cmp, the test arm rewritten
   on its edge (`test a,b` == `cmp a&b,0`). Fallback sites 48 -> 42; the rest
   are in data decoded as code or alias entries starting on a jcc (harmless).
5. **Lifter: pushfd/popfd/cpuid/cvtpi2ps/ld+stmxcsr/cli/sti/wbinvd.** pushfd/
   popfd were dropped (stack imbalance!); cpuid answers as a Pentium III.
   The JPEG decoder's MMX probe (0x0013B620) depends on these.
6. **RECOMP_ABI_RESTORE now off by default** (and read by value). Its
   "repair" undid `__SEH_epilog` (0x0016AAFB) and the hand-written Huffman
   helpers (table 0x002220A0) that return in ebx -> title background was
   noise. NB `RECOMP_ABI_FRAME_HELPER` in recomp_types.h names JSRF's CRT
   addresses, not TDEOD's (0x0016AAC0/0x0016AAFB) -- fix if ever re-enabled.
7. **AA render targets sampled as textures**: TDEOD renders 640x448 at
   CENTER_CORNER_2 (2x horizontal, pitch 2560 R5G6B5) and resolves with a
   linear "1280x480" texture; surface_texture_for scales by the AA factor.
8. The "label not in function" sites from session 1 are **not** switch tables:
   jump tables were already followed. They are bogus functions decoded over
   jump-table data / float tables after a `ret` (gap_prologue,
   tail_jump_alias). Dead code; cleaning them up is optional.

## Session 3 (2026-10-16) -- paused for the PS2 spike

**Paused.** The owner chose to try pareidolico/eod-recomp (PS2 static
recomp, already playable through races) as a macOS base. This branch is kept
as-is; nothing here is deleted.

Done before the pause (uncommitted work committed as WIP):
1. **XInitDevices did nothing**: it tail-jumps (0x001DC9C4) to USBD_Init at
   0x001DBCF8, which the detector missed (it decoded a bogus function over XPP
   data at 0x001DBCC8), so it was an empty "not detected" stub and the game
   never initialised USB. Seeded in `tools/tdeod/seed_functions.json` (now
   passed by regen.sh), plus two shared tails (0x001878CE, 0x0017109B).
   After regen the OHCI controller goes operational and the pad enumerates.
2. **New crash with USB on** (~32 s, before the title): WMA file stream
   thread, sub_000D07A0, stream object pointer garbage (0x8B0774C0) in
   `call [ecx+0x10]`. `RECOMP_USB=0` does not crash, so it is USB-related
   (driver memory writes from the OHCI model? descriptor walk?) or timing.
   **Default boot regresses until this is fixed** -- run with RECOMP_USB=0
   to reach the title as before.
3. `RECOMP_PACE_BOOT=1` (default here): the 60 Hz flip pacing applies from
   the first flip; JSRF's "uncapped until a 100-draw frame" gate left the
   title screen at ~1000 fps. Not yet verified on the title loop.
4. 58 other "not detected" stubs remain in recomp_stubs_unresolved.c; most
   are jumps out of bogus data-decoded functions (dead), but CRT math tails
   (0x0017715E, 0x00177218, 0x00177375) are likely real -- check if hit.

## Current state

Boots headless through logos.xmv and chainsiz.xmv (both play to EOF, audio
stream running) to the **title screen** ("PRESS THE START BUTTON", correct
background, copyright) -- screenshot in work/title_screen_full.png.

## Next steps (in order)

1. **Input (pass requirement, GOALS.md §0)**: the title screen waits for
   START. Inject a virtual pad press first (OHCI/XID layer, src/usb + src/input)
   to go past it and reach the main menu, then build the real layer: Rock
   Candy Xbox 360 wired pad first (SDL3 HIDAPI/IOKit; macOS has no 360
   driver), keyboard as a player port, two XID ports, and a scripted
   two-virtual-pad harness that proves split screen.
2. **Frame pacing**: the title loop presents ~1000+ frames/s (no vblank wait
   on Present/Swap). Find the D3D present-interval wait and make it block on
   the runtime's vblank.
3. **Movie frames on screen**: XMV renders through the PVIDEO overlay; hook
   `g_nv2a_overlay_latch_fn` (xbox_memory_layout.c) to composite the YUY2
   overlay surface (PVIDEO_OFFSET/SIZE/FORMAT at 0x8900..) into the shown
   frame.
4. Metal backend default (`RECOMP_BACKEND`), performance profiling, threading.
5. Optional: stop the disassembler emitting functions over jump-table/float
   data (gap_prologue right after `ret` that overlaps a resynced table).

Modding ideas are parked in docs/MODDING_IDEAS.md (do not start).
