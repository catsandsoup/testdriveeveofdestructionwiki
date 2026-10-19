---
tags: ["models", "vehicles-and-damage", "cross-platform", "historical"]
---
# Vehicles, Models & Damage Subsystem: Reverse Engineering Reference


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. Static disassembly, CPU tests, proposals and live gameplay validation are different evidence levels. See [Battle recovery](/ps2/BATTLE_RECOVERY) for the current native weapon contract.

Source: `docs/wiki/vehicles_and_models.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `81e607a906cf64dd3a99e7b74ddfac9956726a1e23bb01d9da4fa4c8ff85c993`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## 1. Complete Vehicle Roster

*Test Drive: Eve of Destruction* features 32 distinct playable vehicles and 5 specialized trailer models, spanning lightweight compacts to heavy demolition utility vehicles:

| Internal Code | Game Display Name | Vehicle Class | Vanilla Mass | Engine Type | Modding Archetype Role |
|---|---|---|---|---|---|
| `Algar.car` | "Algar" | Midsize Sedan | 2,800 lbs | V6 160 hp | Balanced Derby Contender |
| `Ambulance.car`| "Ambulance" | Heavy Utility | 4,800 lbs | V8 Heavy | Ice Rink Sumo / Quarry Batter |
| `Bat.car` | "Bat" | Compact Hatch | 1,750 lbs | Inline-4 | Agile Evasion Vehicle |
| `Bite.car` | "Bite" | Small Coupe | 1,900 lbs | Inline-4 | Compact Agility |
| `Boxer.car` | "Boxer" | Muscle Beater | 3,200 lbs | V8 220 hp | High Momentum Brawler |
| `Bullet.car` | "Bullet" | Light Stocker | 2,100 lbs | Turbo I4 | Ejector Seat Bowling Dart |
| `Bus.car` | "School Bus" | Super Heavy | 12,000 lbs| Diesel V8 | Trash Compactor Fat Kid / Sweeper Arm |
| `Cockroach.car`| "Cockroach" | Compact | 1,600 lbs | Inline-4 | Trash Compactor Survivor |
| `CopCar.car` | "Cop Car" | Pursuit Heavy | 3,800 lbs | Police V8 | Smokey & The Bandit Interceptor |
| `Durand.car` | "Durand" | Classic Muscle | 3,400 lbs | Big Block V8| Patient Zero Survivor Muscle Car |
| `Digit.car` | "Digit" | Micro Hatch | 1,500 lbs | 1.1L I4 | Lightweight Scramble |
| `Fly.car` | "Fly" | Micro Hatch | 1,450 lbs | 1.0L I4 | The Sweeper Jumping Compact |
| `Hearse.car` | "Hearse" | Super Heavy Wagon| 4,200 lbs | V8 High Torque| Patient Zero "Patient 0" Zombie Tank |
| `Moth.car` | "Moth" | Compact Hatch | 1,650 lbs | 1.3L I4 | Trash Compactor Survivor |
| `Outlaw.car` | "Outlaw" | Heavy Muscle | 3,600 lbs | Supercharged V8| Smokey & The Bandit Robber |
| `Phantom.car` | "Phantom" | Premium Muscle | 3,500 lbs | 426 Hemi V8 | Patient Zero Muscle Survivor |
| `Taxi.car` | "Taxi" | Yellow Cab | 3,100 lbs | V6 180 hp | Quarry Bowling Pin Vehicle |
| `Trailer.car` | "Camp Trailer" | Towed Rigid Body| 1,800 lbs | Passive Hitch | Keanu's Revenge Hot Potato Bomb |
| `BoatTrl.car` | "Boat Trailer" | Towed Rigid Body| 2,100 lbs | Passive Hitch | High-Speed Fishtail Hazard |

---

## 2. Container Format: `.car` Architecture

Each vehicle is packaged into an autonomous `0TSR` archive in `game/data/*.car`. Parsing `Algar.car` reveals its exact internal structure:

```text
Algar.car (0TSR Container)
├── shadow1.mod        (3,840 bytes)  - Near-field planar shadow projection
├── shadow2.mod        (1,824 bytes)  - Mid-field shadow polygon
├── shadow3.mod        (420 bytes)    - Far-field low-poly shadow quad
├── physics.val        (4,958 bytes)  - Powertrain, suspension & mechanical stats
├── Low0.mod           (19,316 bytes) - LOD 0: High-detail cockpit & interior mesh
├── Low1.mod           (224,376 bytes)- LOD 1: Full-detail chassis + 31 detachable parts
├── Low2.mod           (174,852 bytes)- LOD 2: Medium-poly exterior with panel deformation
├── Low3.mod           (46,496 bytes) - LOD 3: Low-poly body shell (23 parts)
├── Low4.mod           (11,056 bytes) - LOD 4: Billboard/impostor distant mesh (10 parts)
├── lod.val            (357 bytes)    - Distance thresholds for LOD mesh switching
├── efx.val            (640 bytes)    - Particle attachment sockets (exhaust, radiator)
├── Bone.val           (3,749 bytes)  - Skeletal deformation hierarchy bones
└── Bone.mvl           (18,704 bytes) - Master vertex-bone binding matrix weights
```

---

## 3. Level of Detail (LOD) Hierarchy & Detachable Parts

### 3.1 The Distance Transition Curve (`lod.val`)
The camera evaluates Euclidean distance $d = \|\vec{P}_{\text{car}} - \vec{P}_{\text{camera}}\|$:
```text
low model base_tex algar.tex
lod0  0    n   # 0 meters: Cockpit interior only (rendered in bumper/hood cam)
lod1  10   y   # 0 - 10m: Full exterior model (31 detachable components)
lod2  15   y   # 10 - 15m: Simplified suspension & subframes
lod3  30   y   # 15 - 30m: Low-poly shell, non-detachable trim
lod4  500  y   # 30 - 500m: Impostor cardboard mesh
shadow 0 10 70 detail5 use min 1 scale 1.0 mirror 3
```

### 3.2 Detachable Component Hierarchy in `Low1.mod`
The primary high-detail exterior model (`Low1.mod`) contains **31 independent sub-objects**, each bound to a deformation bone and physical constraint:
- `hood` (front engine bonnet)
- `trunk` (rear trunk lid)
- `front_bumper` & `rear_bumper`
- `fender_fl` & `fender_fr` (front left / right quarter panels)
- `door_fl`, `door_fr`, `door_rl`, `door_rr` (all 4 doors)
- `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr` (all 4 wheels and hubs)
- `radiator` (engine cooling core; detachment triggers coolant steam efx)
- `windshield`, `rear_glass`, `side_glass_fl..rr` (breakable glass quads)
- `exhaust_pipe` & `muffler`

---

## 4. Mechanical Physics Parameters (`physics.val`)

Each vehicle's mechanical identity is configured inside `physics.val`. These values are parsed at race launch into native memory structures:

### 4.1 Chassis & Suspension
```text
mass 2800.0             # Mass in lbs (converted to kg: ~1,270 kg)
grip 0.90               # Tire lateral friction coefficient mu
damage_scale 1.0        # Multiplier on deformation strain
width 75.0              # Track width in inches
height 51.0             # Overall height in inches
wheelbase 100.0         # Longitudinal wheel separation in inches
cm_height 10.0          # Center of Mass height above axle centerline
wheel_lock 35.0         # Maximum steering angle deflection (degrees)
```

### 4.2 Aerodynamics & Downforce
```text
drag 0.26               # Frontal aerodynamic drag coefficient Cd
frontal_area 19.0       # Frontal projected area in sq ft
lat_drag 0.90           # Lateral wind resistance (affects high-speed spins)
vert_drag 2.0           # Vertical drag (limits jump flight times)
fspoiler_lift 0.0       # Front downforce / lift
rspoiler_lift 0.0       # Rear downforce / lift
```

### 4.3 Engine & Drivetrain
```text
power_max 160.0         # Peak horsepower
torque_max 140.0        # Peak torque in lb-ft
torque_rpm 4800         # RPM at which peak torque occurs
redline 8600            # Engine rev limiter
idle_speed 800          # Neutral idle RPM
num_gears 4             # Forward gear count
gear_ratios 7.00, 3.50, 2.50, 1.50, 1.00  # Transmission reduction ratios
rear_end_ratio 3.73     # Final drive differential ratio
clutch_torque 1600.0    # Clutch slip threshold
```

### 4.4 Impact Detachment Thresholds
```text
damage_impulse 12000.0  # Force in Newtons to trigger plastic bone crumple
removal_impulse 35000.0 # Force in Newtons to sever constraint and detach part
```

---

## 5. Monster Games 3D Model Format (`.mod`)

The `.mod` format is the native 3D mesh container used by both cars and track scenery:

### 5.1 Binary Header Structure (`68 bytes`)
```c
struct ModHeader {
    uint32_t num_submeshes;    // Number of independent submesh objects
    uint32_t header_size;      // Size of header (always 68 / 0x44)
    uint32_t format_version;   // Version (typically 1 or 5)
    uint32_t total_data_size;  // Size of vertex, normal, and index buffers
    float    sphere_center[3]; // Local bounding sphere center (X, Y, Z)
    float    sphere_radius;    // Local bounding sphere radius
    float    box_min[3];       // Axis-aligned bounding box min extents
    float    box_max[3];       // Axis-aligned bounding box max extents
    uint32_t reserved[4];      // Padding
};
```

### 5.2 Submesh Vertex Stream Format
Each submesh defines indexed triangle lists or strips:
- **Position**: 3 × `float32` $(X, Y, Z)$
- **Normal**: 3 × `float32` $(N_x, N_y, N_z)$ for Gouraud / normal lighting
- **Diffuse Color**: 1 × `uint32_t` (ARGB32) used for vertex ambient occlusion
- **UV Coordinates**: 2 × `float32` $(U, V)$ mapping into `.tex` texture sheets
