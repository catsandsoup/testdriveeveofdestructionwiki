---
tags: ["cars", "ai-and-navigation", "cross-platform", "historical"]
---
# AI Logic, Pathfinding & Combat State Machines: Reverse Engineering Reference


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/wiki/ai_and_pathfinding.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `6b519e252e553497becb629b5ef1b1593c6075ed64f48276f10a2e25914580c9`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## 1. The `IDriver` Controller Hierarchy

All vehicle steering, throttle, braking, and combat decisions in *Test Drive: Eve of Destruction* pass through the object-oriented `IDriver` interface (vtable at `0x00203150` on Xbox / `0x003F5BA0` on PS2):

```text
                           IDriver Base (0x00203150)
                                      |
         +----------------------------+----------------------------+
         |                                                         |
   PlayerDriver (0x00202358)                                AIDriver (0x00078EE0)
   [Human Controller Port Input]                            [692 bytes, Spline Racer]
                                                                   |
                                                     +-------------+-------------+
                                                     |                           |
                                           DemoDerbyDriver (0x001FD6C8)    WrangleDriver (0x001FE3F0)
                                           [60 bytes, Combat Automaton]    [60 bytes, Hunter Bot]
```

---

## 2. Circuit & Speedway Racing AI: `AIDriver`

The `AIDriver` object governs all standard circuit, oval, figure-8, and point-to-point races:

### 2.1 Centerline Spline Tracking (`ILine` / `*.ild`)
- **Container Format**: Each track embeds one or more `.ild` files (FourCC `0x494C494E` = `ILIN`), containing a continuous 3D parametric spline network representing the optimal racing line.
- **Track Coordinate Parameter ($s$)**: Position on the track is measured longitudinally along the spline curve, with $s \in [0, L_{\text{track}}]$.
- **Lateral Error Offset ($e_{\text{lat}}$)**:
  $$e_{\text{lat}} = (\vec{P}_{\text{car}} - \vec{P}_{\text{spline}}(s)) \cdot \hat{n}_{\text{lateral}}$$

### 2.2 Dynamic Curvature Lookahead
The AI evaluates upcoming track curvature rather than immediate steering:
$$t_{\text{lookahead}} = \text{clamp}\left(\frac{\|\vec{V}\|}{v_{\text{max}}}, \text{min\_lookahead}, \text{max\_lookahead}\right)$$
Parameters from `track.val` (e.g. `min_lookahead .5`, `max_lookahead 1.0` seconds):
$$\vec{P}_{\text{target}} = \vec{P}_{\text{spline}}(s + \|\vec{V}\| \cdot t_{\text{lookahead}})$$
$$\text{Steering Angle } \delta = \text{clamp}\left(K_p \cdot (\vec{P}_{\text{target}} - \vec{P}_{\text{car}}) \cdot \vec{R}_{\text{car}}, -1.0, +1.0\right)$$

### 2.3 Proximity Collision Avoidance (`Proxer`)
The `Proxer` subsystem evaluates lateral and longitudinal vehicle overlaps:
- Emits raycasts along $\pm 45^\circ$ forward whiskers.
- If an adjacent car overlaps, `AIDriver` applies an evasive lateral bias to $\delta$ to avoid pit-maneuvering or sideswiping walls.

### 2.4 Rubber-Banding & Catch-Up System (`catchup.val`)
The engine dynamically modulates AI engine power to maintain competitive pack density:
- Reads difficulty parameters (`Hard`, `Medium`, `Easy`) and parameters `compare_car_pct`, `effect_t`, `begin_t`.
- When an AI car lags behind the leader, its `power_max` is scaled by factor:
  $$\text{Power Factor} = 1.0 + \text{catchup\_strength} \cdot \left(\frac{d_{\text{leader}}}{d_{\text{threshold}}}\right)$$

---

## 3. Demolition Derby AI: `DemoDerbyDriver`

`DemoDerbyDriver` (`0x000427B0`, vtable `0x001FD6C8`, 60 bytes) powers AI combat inside arenas and bullrings. It bypasses racing splines entirely, executing a **4-state combat finite state machine**:

```text
               +-------------------+
               |  State 1: SEARCH  |
               | (Wander in Bounds)|
               +---------+---------+
                         |
           Opponent Spotted (D < 1.0f)
                         |
                         v
               +-------------------+
        +----->| State 2: PURSUIT  |<-----+
        |      | (Lead Intercept)  |      |
        |      +---------+---------+      |
        |                |                |
Unstick Complete   Closing at Angle   Recovery Timer
(55 frames)        (Speed > 9 m/s)    Expires
        |                |                |
        |                v                |
        |      +-------------------+      |
        |      |   State 3: RAM    |      |
        |      |(Power-Slide Drift)|      |
        |      +---------+---------+      |
        |                |                |
        |          Impact Contact         |
        |                |                |
        +-------+--------+----------------+
                |
          Velocity < 1.4 m/s for 40 frames
                |
                v
       +-------------------+
       |  State 4: UNSTICK |
       |  (Reverse Gear)   |
       +-------------------+
```

### 3.1 State 2: Mathematical Lead-Pursuit Interception
Rather than steering directly at an opponent's current location, `DemoDerbyDriver` computes a predictive intercept coordinate based on target velocity:
$$t_{\text{intercept}} = \text{clamp}\left(\frac{\|\vec{P}_{\text{target}} - \vec{P}_{\text{ai}}\|}{\|\vec{V}_{\text{ai}}\| + 12.0\text{ m/s}}, 0.0\text{ s}, 1.2\text{ s}\right)$$
$$\vec{P}_{\text{lead}} = \vec{P}_{\text{target}} + \vec{V}_{\text{target}} \cdot t_{\text{intercept}}$$
The AI steers toward $\vec{P}_{\text{lead}}$, ensuring high-speed T-bone impacts against cross-cutting opponents.

### 3.2 State 3: Power-Slide Ramming
When closing in on a target at high speed:
- If closing speed $> 9.0\text{ m/s}$ and relative angle $(\vec{F}_{\text{ai}} \cdot \vec{F}_{\text{target}}) &lt; 0.15$:
  - Sets throttle to full: `car + 0x1B7C = 1.0f`
  - Applies handbrake: `car + 0x1B78 = 0.90f`
  - This violently breaks rear-axle traction, causing the AI car to whip sideways and slam its reinforced quarter-panel directly into the target vehicle's cabin.

### 3.3 State 4: Barrier Unstick Recovery
If an AI vehicle becomes pinned against a concrete wall or another disabled car:
- Sensor condition: Linear velocity $\|\vec{V}\| &lt; 1.4\text{ m/s}$ and $\Delta \vec{P} &lt; 0.35\text{ m}$ for **40 consecutive physics ticks** ($0.66\text{ seconds}$).
- Unstick Trigger:
  - Shifts transmission to Reverse: `car + 0x1BB0 = -1`
  - Applies full throttle: `car + 0x1B7C = 1.0f`
  - Reverses steering direction: $\delta = -\delta$
  - Maintains reverse recovery for **55 consecutive ticks** ($0.92\text{ seconds}$), after which it resumes State 2.

---

## 4. Vehicle Hunter & Objective AI: `WrangleDriver`

`WrangleDriver` (`0x00047AE0`, vtable `0x001FE3F0`, 60 bytes) is used for specialized pursuit events (such as "Wrangling", "Detention", and custom modes like Relic Hunt / Hub-World Infection):
- **Continuous Coordinate Chasing**: Completely ignores track boundaries and centerlines. Continuously queries human player positions across the entire map.
- **Pack Surround Behavior**: If multiple `WrangleDriver` instances target the same car, they distribute offset angles around the target (e.g. $+30^\circ$, $0^\circ$, $-30^\circ$), boxing the human driver in from the flanks.
- **PIT Maneuver Execution**: When overlapping the rear quarter of a target, `WrangleDriver` intentionally steers hard into the target's rear axle while maintaining throttle, spinning them out into walls.

---

## 5. Dynamic AI Re-Routing for Modded Tracks

To support custom tracks with dynamic destructible shortcuts (such as the Turn 3 breach in Mankato or the ramp in The Meat Grinder):
1. **Multiple Spline Registration**: The engine loads secondary splines (`shortcut.ild`, `ramp.ild`) alongside the default line.
2. **Dynamic Spline Pointer Swap**: In routine `0x000362C6`, the active spline evaluation pointer is hooked:
   ```cpp
   if (g_track_shortcut_opened) {
       ai_driver->active_spline = g_shortcut_spline;
   } else {
       ai_driver->active_spline = g_main_spline;
   }
   ```
3. When a heavy vehicle shatters a destructible concrete barrier, `g_track_shortcut_opened` is flagged, and computer opponents immediately recalculate their racing line through the newly opened corridor!
