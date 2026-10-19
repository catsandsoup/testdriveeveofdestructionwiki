# Test Drive: Eve of Destruction — Engine Recompilation & Modding Wiki


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. Static disassembly, CPU tests, proposals and live gameplay validation are different evidence levels. See [Battle recovery](/ps2/BATTLE_RECOVERY) for the current native weapon contract.

Source: `docs/wiki/index.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `4896916146a7320dc8d1a70079504cd81a7736c996e94cedf9a91fb65fe10df6`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


Welcome to the technical offline wiki and reverse-engineering reference for the **Test Drive: Eve of Destruction** (`TDEOD` / Monster Games `d2d2`) Static Recompilation and Modern Modding Engine.

---

## 📚 Wiki Contents & Navigation

1. **[Maps & Tracks Subsystem](maps_and_tracks.md)**
   - Monster Games `0TSR` archive structure for tracks (`.trk`).
   - Scene graph rendering meshes (`track.grf`) and Binary Space Partitioning collision trees (`track.bsc`).
   - Spatial trees (`track.bsp`), Potentially Visible Sets (`track.bpp`), and solid placements (`track.sol`).
   - Contest layout scripts (`*.va0`), respawn vectors, dynamic `dyno` physics entities, and boundary polygons (`bound%d`).
   - Hub World architecture (`HomeBase.trk`), venue exit gates, and highway splines.

2. **[Vehicles, Models & Damage Subsystem](vehicles_and_models.md)**
   - Vehicle container layout (`.car`), complete 32-vehicle authentic roster + 5 trailers.
   - 5-stage Level of Detail (LOD) mesh hierarchy (`Low0.mod` to `Low4.mod`) and distance curve (`lod.val`).
   - Monster Games `.mod` 3D container format: header structures, submesh buffers, and vertex attributes.
   - Skeletal deformation bones (`Bone.val`, `Bone.mvl`) and mechanical parameters (`physics.val`).

3. **[Physics, Collision & Detachment Engine](physics_and_collision.md)**
   - Dual-platform memory map correlation: Xbox (`default.xbe`) vs PS2 (`SLUS_209.10`).
   - Vehicle rigid body data layout: position, heading, velocity, mass factor, steering, throttle, and brake floats.
   - The hardcoded 100 mph (44.44 m/s) velocity ceiling at `0x002187D0` and how to scale it.
   - Collision primitive hierarchy: `Ring`, `Tube`, `Box`, `Sphere`, and `Ragdoll`.
   - Physics detachment task (`phystask`) and component/wheel severance routines (`0x00100F10`).

4. **[AI Logic, Pathfinding & Combat State Machines](ai_and_pathfinding.md)**
   - `IDriver` object-oriented hierarchy: `AIDriver`, `DemoDerbyDriver`, `WrangleDriver`, `ParkDriver`.
   - Racing spline navigation (`ILine` / `.ild`), curvature lookahead, speed factor interpolation, and rubber-banding.
   - Demolition Derby 4-state combat automaton: lead-pursuit interception, power-slide ramming, and barrier unstick recovery.
   - Wrangle hunter bot logic: direct coordinate chasing, surround tactics, and pit maneuvers.

5. **[Event Selection & Menu Injection](event_injection_and_menus.md)**
   - Master Event Table at `0x0021BE78` (Xbox) / `0x003C3A70` (PS2).
   - In-memory Contest Table (`0x0022EF60`), Eve Table (`0x002336B0`), and `EveResultsTracker` (`0x002BEDB0`).
   - Action Carousel UI loop at `0x00154650` (`Event %d of %d`).
   - Non-destructive injection hooks: inserting new race modes into Arcade, Multiplayer, and Career selectors.

6. **[Granular Specifications: 15 Custom Game Modes](game_modes_specs.md)**
   - **Mode 1: Patient Zero (Infection)**: Physical collision interception, rust texture swap, mass scaling, horde AI.
   - **Mode 2: Trash Compactor (Speed Halo / Fat Kid)**: Heavy rolling bus down quarry rim, compact evasion.
   - **Mode 3: The Gauntlet Sniper (Horn Mortar Duck Hunt)**: First-person camera crosshair, chicken mortar barrage.
   - **Mode 4: Ice Rink Sumo (Polar Push)**: Black ice tire-slip friction override, out-of-bounds radial elimination.
   - **Mode 5: Smokey & The Bandit (Hot Pursuit)**: Speed threshold sensors, 3-second pin detection, engine kill.
   - **Mode 6: The Sweeper (Twisted System)**: Rotating bus hinge-joint constraint, D-pad vertical impulse jump.
   - **Mode 7: Ejector Seat Bowling (FlatOut Stunts)**: Chassis constraint severance, free-flight ballistic scoring.
   - **Mode 8: The Meat Grinder (Deathloop Crossover)**: Mid-air ramp injection, dual-line counter-traffic AI.
   - **Mode 9: Arena Combat (Battle Mode Pickups)**: Dynamic crate spawning, rear-bumper mine deployment.
   - **Mode 10: Keanu's Revenge (Trailer Hot Potato)**: Trailer hitch constraint, trailing car detonation timer.
   - **Mode 11: Pinball Derby (Kinetic Walls)**: Restitution multiplier override ($e = 2.5$), high-speed ricochets.
   - **Mode 12: Shackled Sprint (Physics Chain)**: Dual-car Hooke's Law spring constraint, distance tension resolution.
   - **Mode 13: Red Light, Green Light**: Velocity vector sensor, 1.5s grace period, moving chassis explosion.
   - **Mode 14: Quarry Bowling**: Stationary pin vehicle cluster, post-impact scatter scoring.
   - **Mode 15: Relic Hunt (Crystal Challenge)**: Spatial trigger tokens, HUD relic counter, `WrangleDriver` buses.

7. **[Granular Specifications: 5 Engine Limitation Overhauls](engine_overhauls_specs.md)**
   - **Overhaul 1: The Infinite Junkyard**: TTL despawn timer deletion, 4,096+ rigid body pool, infinite LOD 0.
   - **Overhaul 2: Dynamic Track Perimeters**: Scenery `IsStatic` flag removal, destructible concrete chunking.
   - **Overhaul 3: The "Eve’s Diner" Cannonball Run**: Hub World + circuit mesh stitching, barrier deletion, continuous highway splines.
   - **Overhaul 4: Dynamic Shortcuts & Campaign Breaches**: Kinetic wall breach triggers, runtime AI spline switching.
   - **Overhaul 5: Hub-World Infection**: Free-roam town loading, `WrangleDriver` hearse horde, midnight headlight lighting.

   - Python CLI tool specifications for `0tsr_tool.py`, `val_editor.py`, `mod_converter.py`, and `ild_editor.py`.

---

## 🏗️ Recompilation Architecture Summary

*Test Drive: Eve of Destruction* (Monster Games, 2004) was developed simultaneously for Microsoft Xbox and Sony PlayStation 2 under internal project codename `d2d2` (*Dirt to Daytona 2*).

```
                      +-----------------------------+
                      |   TDEOD Disc Assets (0TSR)  |
                      |  .trk  .car  .val  .mod     |
                      +--------------+--------------+
                                     |
                                     v
+-------------------------+   +--------------+   +-------------------------+
| Native Recomp Runtime   |-->| Physical     |<--| Modern Host APIs        |
| - Guest Lock & Memory   |   | Simulation   |   | - Metal MSL Render      |
| - CRT memmove & SEH     |   | - Rigid Body |   | - SDL3 Audio / APU      |
| - Master Bitmask Hook   |   | - 60Hz Tick  |   | - Virtual Gamepad / USB |
+-------------------------+   +--------------+   +-------------------------+
```

By lifting x86 instructions into native C/C++ (Apple Silicon `arm64` and x86_64), the console limits are bypassed:
- **System Memory**: Unlimited host 64-bit virtual memory vs Xbox 64MB / PS2 32MB.
- **Physical Rigid Bodies**: Scalable dynamic pools ($4,096+$) vs hardcoded console pool ($32$ bodies).
- **Debris Lifetime**: Permanent scrap and part persistence vs ~5-second despawn timers.
- **Level of Detail**: Full highest-quality geometry (`Low0.mod`) rendered across entire venues.
- **Display Output**: Native arbitrary aspect ratios (16:9, 21:9) and high-refresh rendering (120 FPS+).
