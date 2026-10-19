---
tags: ["physics", "collision-and-rigid-bodies", "cross-platform", "historical"]
---
# Physics, Collision & Detachment Engine: Reverse Engineering Reference


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/wiki/physics_and_collision.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `5b1e345a1b283a86b9ed0be6392c75a495b49d69de36d25d5ec6621bfd1c66b0`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## 1. Dual-Platform Memory Map Correlation

The vehicle rigid body structures in memory are virtually identical between Microsoft Xbox (`default.xbe`) and Sony PlayStation 2 (`SLUS_209.10`), differing only by minor 4-byte padding offsets:

| Attribute | Xbox Offset (`default.xbe`) | PS2 Offset (`SLUS_209.10`) | Type | Description & Value Range |
|---|---|---|---|---|
| Right Vector $\vec{R}$ | `car + 0x60..0x68` | `car + 0x64..0x6C` | `float[3]` | Normalized chassis lateral axis $(R_x, R_y, R_z)$ |
| Up Normal $\vec{U}$ | `car + 0x6C..0x74` | `car + 0x70..0x78` | `float[3]` | Normalized chassis vertical axis $(U_x, U_y, U_z)$ |
| Forward Vector $\vec{F}$| `car + 0x74..0x7C` | `car + 0x7C..0x84` | `float[3]` | Normalized chassis longitudinal axis $(F_x, F_y, F_z)$ |
| Position Vector $\vec{P}$ | `car + 0x80..0x88` | `car + 0x88..0x90` | `float[3]` | World coordinates $(P_x, P_y, P_z)$ in meters |
| Linear Velocity $\vec{V}$ | `car + 0x100..0x108`| `car + 0x104..0x10C`| `float[3]` | Linear velocity vector $(V_x, V_y, V_z)$ in m/s |
| Angular Velocity $\vec{\omega}$| `car + 0x110..0x118`| `car + 0x114..0x11C`| `float[3]` | Yaw, pitch, and roll rate in rad/s |
| Steering Ratio | `car + 0x1B6C` | `car + 0x1B6C` | `float` | Target steer angle: $[-1.0, +1.0]$ |
| Throttle Input | `car + 0x1B7C` | `car + 0x1B70` | `float` | Accelerator pedal application: $[0.0, 1.0]$ |
| Footbrake Input | `car + 0x1B74` | `car + 0x1B74` | `float` | 4-wheel deceleration torque: $[0.0, 1.0]$ |
| Handbrake Input | `car + 0x1B78` | `car + 0x1B78` | `float` | Rear wheel lockup & drift trigger: $[0.0, 1.0]$ |
| Chassis Mass Factor | `car + 0x1B88` | `car + 0x1B88` | `float` | Rigid body mass multiplier (default $1.0f$) |
| Transmission Gear | `car + 0x1BB0` | `car + 0x1B90` | `int32_t` | `1` = Forward 1st..4th, `-1` = Reverse, `0` = Neutral |
| AI / Human Controller Flag | `car + 0x1BDC` | `car + 0x1BDC` | `uint32_t` | `0` = Human Player, `1` = Autonomous AI Bot |
| Structural Damage Ratio | `car + 0x1BEC` | `car + 0x1BEC` | `float` | $D \in [0.0, 1.0]$ ($1.0$ = totaled / wrecked) |

---

## 2. Vehicle Driving Update & Top Speed Cap

### 2.1 Forward Velocity Projection
Every physics frame (60Hz fixed timestep), the engine evaluates forward speed by computing the dot product between the linear velocity vector and the forward heading vector:
$$v_{\text{forward}} = \vec{V} \cdot \vec{F} = V_x F_x + V_y F_y + V_z F_z$$

### 2.2 The Hardcoded 100 mph (44.44 m/s) Ceiling
In the vanilla disassembly:
- **Xbox (`0x000691F7` / `sub_00068DB0`)**:
  ```x86
  00069218: mov dword ptr [esp + 0x14], 0x3fc00000 ; 1.5f Force multiplier
  ...
  00069250: cmpss xmm0, dword ptr [0x002187D0]     ; 0x002187D0 = 44.4444427f m/s (100.0 mph)
  00069258: jge   L_disengage_boost                ; CUT OFF BOOST IF SPEED >= 100 MPH!
  ```
- **PS2 (`0x0018F508` / `HumanDriver::DriveUpdate`)**:
  ```mips
  0018f508: lui   $at, 0x4231
  0018f50c: ori   $at, $at, 0xC71D                 ; 0x4231C71D = 44.444447f m/s
  0018f550: c.lt.s $f22, $f2                       ; compare forward speed ($f22) with 44.44 m/s
  0018f558: bc1f  L_disengage_boost
  ```

### 2.3 Recomp Ceiling Expansion & Scaled Turbo
In the modern recompiled runtime, this limit is lifted:
$$v_{\text{cap}} = 44.444447\text{ m/s} \times \text{turbo\_scale}$$
For `turbo_scale = 1.75f`, $v_{\text{cap}} \approx 77.78\text{ m/s}$ ($174.0\text{ mph}$), allowing high-velocity muscle cars to break free on straightaways.

---

## 3. Collision Primitive Hierarchy

Monster Games implements a hierarchical multi-primitive collision detection engine:

```text
                  Master Collision System
                             |
         +-------------------+-------------------+
         |                                       |
  Static World Polygon                    Dynamic Rigid Bodies
   (track.bsc BSP Tree)                     (OBB & Primitives)
                                                 |
             +-----------+-----------+-----------+-----------+
             |           |           |           |           |
           Ring        Tube         Box        Sphere     Ragdoll
         (Wheels)    (Axles)      (Body)     (Projectiles) (Drivers)
```

1. **`Box` (Oriented Bounding Box - OBB)**: Used for main car bodies, trailers, and shipping containers. Encodes center $\vec{C}$, half-extents $(e_x, e_y, e_z)$, and orientation matrix $(\vec{R}, \vec{U}, \vec{F})$.
2. **`Ring` (Annulus Primitive)**: Used for wheels and tires to simulate ground contact, camber angles, and lateral scrub.
3. **`Tube` (Cylindrical Capsule)**: Used for suspension arms, axles, and roll bars.
4. **`Sphere` (Radial Bounding Sphere)**: Used for coarse broad-phase culling and projectile collision (`Ball` chicken mortar).
5. **`Ragdoll` (Linked Jointed Bodies)**: Articulated multibody structure with joint angular limits.

---

## 4. Detachment Mechanics & Physics Tasks (`phystask`)

When a vehicle suffers a high-energy kinetic impact, the engine calculates the localized shear force:
$$\vec{F}_{\text{impact}} = \frac{m_{\text{striker}} m_{\text{victim}}}{m_{\text{striker}} + m_{\text{victim}}} \frac{\Delta \vec{V}}{\Delta t}$$

### 4.1 Detachment Pipeline
1. If $\|\vec{F}_{\text{impact}}\| > \text{damage\_impulse}$ ($12,000\text{ N}$), the deformation bone in `Bone.val` undergoes plastic deformation, crinkling the local mesh vertices.
2. If $\|\vec{F}_{\text{impact}}\| > \text{removal\_impulse}$ ($35,000\text{ N}$), the bone constraint is severed:
   - Routine `0x00100F10` allocates a 68-byte detached rigid body instance.
   - Constructor `0x000A3220` inherits the integration car's linear velocity plus an impact scatter impulse:
     $$\vec{V}_{\text{detached}} = \vec{V}_{\text{car}} + \frac{\vec{F}_{\text{impact}}}{m_{\text{part}}} \times 0.25$$
   - The detached part is registered into the active physical simulation pool (`0x0006BC20`: `"phystask: detaching at %d ticks!"`).
3. **Vanilla Despawn Timer**: On Xbox/PS2, a 300-tick (~5.0 second) Time-To-Live countdown is started. When expired, the part is despawned. **In the modern recomp, this timer is completely bypassed to enable permanent debris fields.**

---

## 5. Ballistic Projectiles & Explosive Shockwaves

### 5.1 Projectile Kinematics (`Ball` Object, `0x228` bytes)
The explosive chicken mortar ("Horn Mortar") spawns a `Ball` physical projectile with vtable at `0x003F9528`:
$$\vec{V}_{\text{launch}} = \vec{V}_{\text{car}} + (0.707 \vec{F} + 0.495 \vec{U}) \times 24.89\text{ m/s}$$

### 5.2 Radial Shockwave Detonation (`f_0017DA58`)
Upon contact with any surface or vehicle bounding box:
1. Detonation radius: $R_{\text{blast}} = 12.0\text{ meters}$.
2. The engine iterates across all active cars $i \in [0, num\_cars - 1]$:
   - Distance: $d = \|\vec{P}_{\text{car}} - \vec{P}_{\text{blast}}\|$.
   - If $d \le R_{\text{blast}}$, attenuation factor:
     $$\alpha = \left(1.0 - \frac{d}{R_{\text{blast}}}\right)^2$$
   - Radial impulse vector applied at center of mass:
     $$\vec{J}_{\text{shock}} = \alpha \times 45,000\text{ N}\cdot\text{s} \times \frac{\vec{P}_{\text{car}} - \vec{P}_{\text{blast}}}{d} + (0, 15000, 0)$$
   - The vertical component $(0, 15000, 0)$ launches the affected vehicle into the air, initiating dynamic rolls.

---

## 6. Physical Constraints: Springs & Hinge Joints

To support custom modes (such as Shackled Sprint and The Sweeper), the engine's constraint solver resolves two primary joint types:

### 6.1 Distance Spring Constraint (Hooke's Law with Damping)
Between body A and body B with rest length $L_0$:
$$d = \|\vec{P}_B - \vec{P}_A\|, \quad \hat{n} = \frac{\vec{P}_B - \vec{P}_A}{d}$$
$$\vec{F}_{\text{spring}} = \begin{cases}
k (d - L_0) \hat{n} + c ((\vec{V}_B - \vec{V}_A) \cdot \hat{n}) \hat{n} & \text{if } d > L_0 \\
\vec{0} & \text{if } d \le L_0
\end{cases}$$

### 6.2 Angular Hinge Joint Constraint
Constrains a body's position to pivot $(X_0, Y_0, Z_0)$ while integrating constant or accelerating angular velocity:
$$\vec{\omega}(t) = \vec{\omega}_0 + \vec{\alpha} t$$
$$\vec{V}_{\text{linear}} = \vec{\omega} \times (\vec{P} - \vec{P}_{\text{pivot}})$$
This produces the continuous clock-hand sweep required for rotating obstacle hazards.
