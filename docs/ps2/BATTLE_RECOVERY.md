# Battle recovery: native weapon contract and validation


:::note Source and evidence
PS2 implementation notes. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/BATTLE_RECOVERY.md` in `eod-recomp`. Repository HEAD: `67c972b0fed775994d1769382676bd94ebdc3bc7`. Working-copy modifications: `yes`. Source SHA-256: `7f72123c7251e054495306a149d22a50d8f5d4f5986413f127097bffdf966d24`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


Status: focused native CPU evidence verified on 2026-10-19; live acceptance and
bot completion are pending. This chapter supersedes conflicting weapon, input,
registry and respawn claims in [the historical gameplay notes](GAMEPLAY_MODS_RE.md).
It describes the North American `SLUS_209.10` executable only. Addresses are
guest EE addresses, not host pointers or portable APIs for another game.

## Player success and acceptance

The player can enter original two-player Battle with independent controls and
visible native chickens. A shot follows the car's orientation, collides and
explodes, attributes the hit to the correct player, and reloads on the original
timer and release/repress sequence. Optional bots must preserve every human
controller and complete the same native lifecycle: drive, attack, recover,
shoot, respawn, score and finish a match. Native track geometry and spawn
transforms remain authoritative.

Required evidence combines instruction/ABI inspection, focused native tests,
rendered gameplay, scripted inputs and RAM state. Passing a mock input test or
seeing a nonzero velocity does not prove visible player success. The bounded
recovery targets at most four participants; increasing the native participant
capacity requires separate structural work.

## What reverse engineering and recompilation establish

**Reverse engineering** here means recovering the executable's contracts from
instructions, call sites, memory writes and observed behavior. Labels such as
"body", "interface" and "owner" are descriptions supported by those uses;
they are not recovered original C++ declarations.

**Disassembly** exposes the original MIPS instructions. **Decompilation** would
reconstruct higher-level source from them, without guaranteeing the original
variable names, types or structure. This investigation uses the disassembler
and the project's generated translation as evidence; it is not a recovered
original-source release.

**Static recompilation** translates guest instructions into host-compiled code
which still operates on the guest register state and memory. Generated
`f_0017E000(void)` therefore receives its arguments through `g_ee`, not through
ordinary host C++ parameters. The generated function and native MIPS function
share a guest address identity, but successful compilation alone does not prove
correct runtime semantics.

**Modding** intentionally changes behavior around that baseline. Extra blast
force, custom bots or a different launch mode are modifications, not evidence
that the original weapon has been restored. Keep native acceptance and optional
mod acceptance distinct. Do not repair a guessed ABI by adding more guessed
state writes.

## Native address evidence

Evidence was inspected in the owner's local `gen/rec_020.c`, `gen/rec_021.c` and
`gen/rec_023.c`, with the guest addresses below as stable lookup keys. Generated
file partitioning can change. Source checkout at the initial focused test run:
`67c972b0fed775994d1769382676bd94ebdc3bc7` plus the uncommitted recovery changes.
This is a provenance checkpoint, not a claim that this commit alone contains
the recovery.

| Guest function / site | Observed contract | Evidence scope |
| --- | --- | --- |
| `0x0017DE30` | Registers interface `$a0`, owner index `$a1`, slot `$a2` into a 12-byte row. | Generated native stores. |
| `0x0017DE78` | Queries owner `$a0` and slot `$a1`; returns the row's interface in `$v0`, or zero. | Generated comparison and return paths. |
| `0x0017EA10`, registration call near `0x0017EB98` | Initialization registers `body+0x1DC`, owner from `body+0x1E8`, slot zero. | Native initializer; not covered by the focused fixture. |
| `0x0017DFA8` | Allocates a `0x228`-byte body and performs constructor work. | Does not establish that allocation alone completes gameplay initialization. |
| `0x0017E000` | Trigger takes interface `$a0`, car body `$a1`, input pointer `$a2`; subtracts `0x1DC` from interface. | Executed by focused test. |
| `0x0017AF80` | Copies a 48-byte pose into body+`0x64`, then propagates scene/bounds state. | Native copy executed; downstream propagation stubbed. |
| `0x0017E4D8` | With master and weapon enabled, stores state zero and deadline `now+3`. | Executed by focused test. |
| `0x0017E5C8`, `0x0017E5F8`–`0x0017E624` | Native update advances expired cooldown to release-waiting state. | Timer path executed; downstream physics/render work stubbed. |
| `0x0018FC1C`–`0x0018FCB8` within `0x0018F2A8` | Human driver gates on master+weapon, queries by controller+`0x40` owner index, reads L2 and calls interface vtable+8 with car and input pointer. | Native caller inspection; full driver not executed by focused test. |
| `0x0017E718`, call at `0x0017E7FC` | Detonation passes body+`0x88` position and body+`0x1E8` attacker index to `0x0017DA58`. | Native caller inspection; damage/score acceptance pending. |
| `0x0017DA58` | Resolves attacker index through `0x00179A08` before the native radial impulse path. | Ownership flow inspected; not exercised by focused fixture. |
| `0x0018AA80` | Stores steering `$f12` at car+`0x1B6C`. | Native setter inspection. Writing car+`0x1B80` is not this steering contract. |

Reinspect locally with the owner's executable and analysis metadata present:

```sh
.venv/bin/python tools/dis.py -f 0017DE78
.venv/bin/python tools/dis.py -f 0017E000
.venv/bin/python tools/dis.py -f 0017E4D8
.venv/bin/python tools/dis.py -f 0017E5C8
.venv/bin/python tools/dis.py -f 0017E718
.venv/bin/python tools/dis.py -f 0018AA80
```

Do not commit the executable, generated functions, RAM dumps, captures or
binaries. Commit authored tests, extraction tools and interpreted findings.

## Registry, body and input ABI

The registry starts at `0x003CE3F8`, with count at `0x003CE4B8`. A row contains:

| Row offset | Meaning |
| --- | --- |
| `+0x00` | Owner/car **index**, not a car pointer. |
| `+0x04` | Weapon slot. Native chicken initialization uses zero. |
| `+0x08` | Weapon interface pointer. For this chicken, `interface = body+0x1DC`. |

The trigger reads a 32-bit pressed value at `$a2`; the native human caller
provides a two-word input structure with the second word zero. Forward both
pressed and released input through the native call. A call to `0x0017E5C8`
does not replace the trigger, and writing body offsets relative to a registry
interface corrupts a different memory region.

Relevant body fields are:

| Body offset | Meaning used by the inspected routines |
| --- | --- |
| `+0x7C` | Forward vector after native pose copy. |
| `+0x88` | World position. |
| `+0x94` | Identifier copied from the car by the trigger. |
| `+0x104` | Launch/linear velocity vector. |
| `+0x1DC` | Weapon interface/vtable location. |
| `+0x1E0` | Trigger state: 0 cooldown, 1 awaiting release, 2 armed. |
| `+0x1E4` | Cooldown deadline, float. |
| `+0x1E8` | Registered owner index; preserved by firing. |
| `+0x1F4` | In-flight marker. |
| `+0x210`, `+0x214`, `+0x218` | Effect object pointers used across initialization/flight/detonation. |
| `+0x21C` | Local muzzle offset, three floats. |

The native initializer establishes more than the registry entry: it assigns
ownership, initializes scene state and attaches effects. Allocation followed by
handwritten registry rows and a fabricated ready flag is not an equivalent
initialization path. Use the existing native lifecycle and query its interface.

## Straight Battle, feat mortar and rain

The active mask is `0x003C4190`:

| Bits | Consequence in the inspected paths |
| --- | --- |
| Master `0x1` and weapon `0x8` | Native human weapon dispatch and three-second cooldown enabled. |
| Master and `0x10` | Feat mortar launch branch. This is not required for a straight Battle shot. |
| Master and `0x80` | Rain velocity branch, checked before the mortar branch. |

Let `F` and `U` be the pose's forward/up vectors and `V` the car velocity.
The native trigger computes:

- Straight Battle: `F * (length(V) + 28)`.
- Feat mortar: `(F * 0.707 + U * 0.4949) * 24.888889 + V`, with native float
  constants and instruction-order rounding.
- Rain branch: `(0, -19.62, 0)`.

These are initial velocities, not a promise of gravity-free or collision-free
flight. A sideways or reversing car contributes its speed magnitude to the
straight shot; mortar adds the velocity vector. Pitch affects the straight
shot because it follows the car's forward axis. The native trigger also
transforms the muzzle offset by the car pose before launching.

For the straight optional Chicken Fight mod, master+weapon is `0x09`; forcing
`0x19` selects mortar. If turbo is also enabled, the corresponding straight-shot
mask is `0x0B`, before unrelated flags. Preserve the distinction between flags
owned by the optional mod and flags established by native Battle/feat selection.

## Reload and release/repress

The native clock is a float at `0x003CDACC`. With master+weapon enabled, firing
sets state zero and deadline `now+3`. The update changes state zero to one only
when `now > deadline`; equality does not expire it. Held input leaves state one
waiting. Released input changes one to two without firing. A subsequent pressed
input in state two fires and starts a new cooldown.

Early release/repress during cooldown does not bypass the timer. In-flight state
is separate from trigger state: the original trigger does not use it as an
additional ready gate. Do not introduce a different reload model by equating
in-flight with cooldown or by manually resetting either field. Collision,
detonation and reset paths own the remaining projectile lifecycle.

## Focused tests and verified results

[`extract_native_weapon_reference.py`] (`../tools/extract_native_weapon_reference.py`, source checkout)
reuses the existing movie-bit reference extraction approach. At build time it
extracts the owner's generated `0x0017E000`, `0x0017E4D8`, `0x0017E5C8` and
`0x0017AF80` into the build directory. The checked-in
[`native_weapon_test.cpp`] (`../tests/native_weapon_test.cpp`, source checkout) contains synthetic
inputs and authored assertions, not copied retail functions.

Scene/bounds propagation `0x0017A498` and per-frame physics/render work
`0x0017F4E0` / `0x0017BBC0` are boundary stubs. None changes weapon state or
velocity. Unexpected owner lookup, rain spawn or hidden-pose update paths fail
the test. The native trigger, timer state transitions and pose copy stay real.

```sh
EOD_HEADLESS=1 EOD_MUTE=1 cmake --build build-mac --target native_weapon_test -j2
EOD_HEADLESS=1 EOD_MUTE=1 ctest --test-dir build-mac \
  -R '^native_chicken_weapon$' --output-on-failure -V
```

The initial coordinated run passed **138 checks in 0.26 seconds**. Cases cover
stationary launch, lateral/reverse speed, quarter turn, oblique yaw, pitch,
transformed muzzle position, flag gating/precedence, cooldown equality/expiry,
held suppression, release/repress, preserved owner and effect activation.

This is a native behavior characterization test. It does not itself execute the
production mod's flag-selection hook or full HumanDriver path. Separate wrapper
tests must prove those integrations. It also does not prove initialization,
rendered flight, collision, explosion damage/credit, reset, respawn or a complete
match. Retaining an owner integer in a fixture is weaker evidence than observing
correct scoring after a real hit.

## Prior art and evidence method

Checked [Road Trip Adventure's development guide at revision
`0f6d3613e8e32ccda5305227a578b1fb659983a8`](https://github.com/silentsudin/RoadTripAdventure-recomp/blob/0f6d3613e8e32ccda5305227a578b1fb659983a8/docs/DEVELOPING.md).
Its regression approach combines deterministic guest time, scripted pad input,
headless execution, exact frame capture and RAM observations. Reuse that method
of connecting an input to observable state and pictures. Its game structures,
addresses and driving model belong to a different executable and are not EOD
weapon or Battle contracts. No Road Trip game structure is copied here.

EOD already has `tools/padscript.py`, independent `EOD_PAD_SCRIPT` and
`EOD_PAD_SCRIPT1`, bounded `--frames` runs, screenshot output and `EOD_DUMP_RAM`
at exit. `tools/test_2p_race.sh` demonstrates independent scripted controllers;
its race navigation sequence is not a Battle acceptance test. Keep a dedicated
Battle script and exact configuration with each result. Do not call EOD runs
bit-identical merely because the input schedule repeats; establish that property
with measured state/frame comparisons first.

Automated builds and game runs must be coordinated, headless and muted. Use
`EOD_HEADLESS=1 EOD_MUTE=1`, plus `--headless` for the game. Start native baseline
validation at 1x PS2 resolution, 4:3, original timing and no frame skipping.
Archive local evidence under ignored work/build directories, not the repository.

## Pending validation — runtime and bots

The following are acceptance requirements, not completed results. The primary
investigator should replace each pending item only with identified evidence.

| Pending check | Evidence needed |
| --- | --- |
| Original two-player Battle | Exact build/config/input sequence; independently controlled P1/P2; rendered native shots; RAM/trace correlation. |
| Reload in a real match | First shot, held input through expiry, release, second press; matching native state/deadline and visible second shot. |
| Collision, blast and ownership | Native impact/detonation path; correct attacker and victim; score changes consistent with the hit. |
| Optional native-path bots | One human plus three bots and two humans plus two bots; no human-controller replacement; native registration and trigger use. |
| Recovery and respawn | Observed wall recovery and native respawn transforms on the actual track; no invented world-origin circle or unsupported time guarantee. |
| Complete lifecycle | Countdown, combat, death, respawn, score threshold, results, restart and exit without stale state. |
| Regression validation | Full coordinated CTest run and relevant normal-race/control checks after final code changes. |

## STAR handoff

**Situation:** historical implementation/notes mixed the weapon interface with
the body, treated update as fire, forced the mortar flag, and made unsupported
claims about synthetic registration, bots and arena relocation.

**Task:** recover the original weapon/control contract before extending Battle,
then prove the player acceptance above with live evidence.

**Action:** inspected native call sites and stores, documented ABI/flags/state,
added build-local extraction and focused native tests, and marked conflicting
historical documentation. The chapter intentionally leaves bot and live-runtime
results pending for the primary investigator.

**Result:** the focused native CPU suite passes; visible player acceptance is
not established by this chapter. Next decisive test is a bounded rendered
two-player Battle with independent inputs and native shot/reload state traced
through a real collision and score event, followed by the optional bot matrix.
