---
tags: ["cars", "combat-and-ai", "ps2", "technical-reference"]
---
# Native weapon test handoff


:::note Source and evidence
Native PS2 investigation evidence. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `work/native-weapon-tests.md` in `investigation session`. Repository HEAD: `session working notes`. Working-copy modifications: `yes`. Source SHA-256: `169841380f0de9e193860ec9cf5f19c3d98c0f8ea9c8ab76d7931d8d609e5f1b`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## Player success, acceptance and limits

As a player, I can press L2 to fire the original Battle chicken in the direction
the car faces, including when turning or driving on a slope. Holding the button
must not repeatedly fire; after native cooldown, releasing and pressing again
must fire another chicken. The feat mortar flag must remain distinct from the
straight Battle launch.

CPU acceptance: execute the owner's generated native trigger/cooldown routines
against synthetic EE memory; check launch velocity, muzzle position, in-flight
state, cooldown deadline and release/repress transitions. This cannot establish
the patch's registration/input routing, visible projectile flight, collision,
damage, or original-console visual fidelity. Those need the integration investigation's live
game and integration checks.

## Situation

The previous lightweight live-cheat test stubs the trigger, so it cannot prove
what the native chicken does with a chosen flag, car pose or velocity. Native
`f_0017E000` takes the weapon interface at body+0x1dc. `f_0017E5C8` is the object
update and is not a trigger replacement.

## Task

Add a focused CPU test which executes real generated code without shipping any
retail-generated source. Owned files are the new test, extractor and CMake
integration only. Do not modify the integration's game patch or live-cheat tests.

## Action

Reused the repository's existing `tools/extract_movie_bits_reference.py` pattern:
extract named generated functions into the build directory at build time. Added
`tools/extract_native_weapon_reference.py`, `tests/native_weapon_test.cpp`, CMake
target `native_weapon_test` and CTest `native_chicken_weapon`.

The extracted routines are native trigger `0017E000`, native cooldown `0017E4D8`,
native update `0017E5C8`, and native pose copy `0017AF80`. The test stubs only
downstream scene/bounds propagation `0017A498` and per-frame scene/physics work
`0017F4E0` / `0017BBC0`. Unexpected owner lookup, rain spawn and hidden-pose
callbacks fail the test rather than silently returning. No stub changes weapon
state, launch velocity, or cooldown.

Verified details from the locally generated routines:

- Flags are at 0x3c4190. Master 0x1 plus weapon 0x8 enables the three-second
  cooldown. Master plus 0x10 selects the feat mortar trajectory; master plus
  0x80 selects rain before mortar.
- Battle launch velocity is body forward multiplied by (car speed magnitude +
  28). Lateral/reverse vehicle velocity contributes through magnitude, rather
  than vector addition.
- Mortar velocity is `(forward * .707 + up * .4949) * 24.888889 + car velocity`,
  using the native float literals. Rain velocity is `(0, -19.62, 0)`.
- The clock lives at 0x3cdacc. State body+0x1e0 is 0 during cooldown, 1 while
  awaiting release, and 2 when armed. Body+0x1e4 is the deadline. The native
  update transitions 0->1 only when time is strictly greater than deadline.
- Armed plus pressed fires. State 1 plus released changes to 2 without firing.
  Holding through expiry does not fire. Early release/repress during state 0
  does not bypass cooldown.
- Trigger copies car+0x94 to body+0x94 and retains owner at body+0x1e8. In-flight
  is set at body+0x1f4. Muzzle offset is body+0x21c, transformed by car pose.

The fixture covers six literal expected launch/muzzle vectors: stationary,
lateral movement with speed 13, reverse movement, quarter turn, oblique yaw, and
pitched car. It also covers flag precedence/master gating, cooldown flag gating,
strict deadline equality, hold/release/repress, and effect memory activation.

Reuse research: checked the recommended Road Trip Adventure recomp project at
https://github.com/silentsudin/RoadTripAdventure-recomp (HEAD observed
`0f6d3613e8e32ccda5305227a578b1fb659983a8`, 2026-10-19). Its README describes a
different game's PS2Recomp-based runtime, so that game's behavior cannot serve
as an EOD weapon oracle. The already available local extraction pattern and
this game's original generated routines are the relevant reusable wheel.

## Result

After coordinating exclusive build time with the integration:

```
EOD_HEADLESS=1 EOD_MUTE=1 cmake --build build-mac --target native_weapon_test -j2
EOD_HEADLESS=1 EOD_MUTE=1 ctest --test-dir build-mac -R '^native_chicken_weapon$' --output-on-failure -V
```

Build succeeded. CTest passed: **138 checks**, **0.26 seconds**. `git diff --check`
also passed. Generated test code remains in the ignored build directory. No
game was run by this investigation and no production patch file was edited.

Not claimed: the whole suite was not run by this investigation because integration owns
coordinated game/build validation. The CPU cases do not establish visible
player success. Next decisive test: run the patched live registration/input
path with native L2 input, verify the straight native shot and a second shot
after cooldown/release/repress, then complete the full coordinated CTest suite.
