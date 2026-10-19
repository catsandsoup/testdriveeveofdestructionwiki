# Maps & Tracks Subsystem: Reverse Engineering Reference


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/wiki/maps_and_tracks.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `f010398d39629160326f0fb873213cfcfeefb47edaea247013b1ab4665f9c863`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## 1. Overview & Venue Directory

All tracks and world environments in *Test Drive: Eve of Destruction* are packaged into proprietary Monster Games `0TSR` (`RST0`) archives in `game/data/*.trk`.

### 1.1 Authentic Venue Inventory
The retail release contains 15 primary racing and demolition venues, plus the open-world Hub World:

| Venue File | Compressed Size | Venue Type | Track Layouts Available |
|---|---|---|---|
| `Afton.trk` | 9.5 MB | Rural Dirt Oval | Circuit, Reverse |
| `Anoka.trk` | 11.4 MB | Dirt Short Track | Circuit, Figure-8, Jump |
| `Baxter.trk` | 10.4 MB | Concrete Arena / Speedway | Oval, Figure-8, Demolition Arena, Battle |
| `Bemidji.trk` | 8.7 MB | Paved Short Track | Circuit, Reverse |
| `Dennison.trk` | 8.8 MB | Dirt Arena | Demolition Derby, Survival, Push-Off |
| `Dundas.trk` | 11.7 MB | Rural Point-to-Point / Mud Trail | Point-to-Point, Figure-8 |
| `Eagan.trk` | 9.8 MB | High-Banked Dirt Oval | Oval, Suicide Race |
| `Gilroy.trk` | 11.9 MB | Fairgrounds Short Track | Circuit, Jump Race, Flagpole |
| `Hastings.trk` | 8.1 MB | Tight Dirt Bullring / Arena | Figure-8, Demolition Derby, Battle |
| `Kenyon.trk` | 8.8 MB | Speedway & Mega Ramp | Straightaway, Long Jump |
| `Mankato.trk` | 11.1 MB | Urban Demolition Arena | Demo Derby, Figure-8, Arena Battle |
| `Springfield.trk`| 9.4 MB | Paved Oval / Road Course | Circuit, Forward-Backward |
| `Welch.trk` | 7.1 MB | Muddy Demolition Valley | Figure-8, Arena Derby |
| `HomeBase.trk` | 12.3 MB | **Semi-Open Hub World** | Rural Town, Eve's Diner, Highways, Junkyard |
| `EmptyTrack.trk`| 139 KB | Testbed / Benchmark Grid | Blank Flat Plane (Developer Testbed) |

---

## 2. Container Format: Monster Games `0TSR`

The `.trk`, `.car`, and `.res` files share the exact same `0TSR` container format:

### 2.1 File Header (`0x00..0x20`)
```c
struct TSRHeader {
    char     magic[4];       // "0TSR" or "RST0" (0x52535430)
    uint32_t version;        // Container format version (typically 1)
    uint32_t header_size;    // Size of master header (typically 0x20)
    uint32_t total_size;     // Total size of container file in bytes
    uint32_t info_offset;    // Byte offset to File Information Table
    uint32_t file_count;     // Total number of embedded sub-files
    uint32_t reserved[2];    // Padding / alignment
};
```

### 2.2 File Information Entry (`68 bytes` per sub-file)
Located starting at `info_offset`. Each entry describes one sub-file:
```c
struct TSREntry {
    char     filename[32];   // Null-terminated filename (e.g. "track.bsc\0")
    uint32_t file_type;      // FourCC asset type identifier (see table below)
    uint32_t flags;          // Compression / streaming flags
    uint32_t decomp_size;    // Uncompressed byte size
    uint32_t data_offset;    // Offset relative to info_offset where payload begins
    uint32_t padding[4];     // Reserved
};
```

---

## 3. Sub-File Types Inside `.trk` Archives

| FourCC | Magic String | Filename | Subsystem Function | Loader Hook in `default.xbe` |
|---|---|---|---|---|
| `0x47524146` | `GRAF` | `track.grf` | Scene Graph & Visual Mesh | `0x000A2980` via `call 0x000A80B0` |
| `0x53434F4C` | `SCOL` | `track.bsc` | Binary Space Partitioning Collision Tree | `0x000A295D` via `call 0x0009D770` |
| `0x42535054` | `BSPT` | `track.bsp` | Visual Spatial Octree / Culling Tree | `0x000A2967` via `call 0x000A9450` |
| `0x42505054` | `BPPT` | `track.bpp` | Potentially Visible Set (PVS) Occlusion Table | `0x000A2971` via `call 0x000A7AE0` |
| `0x534F424C` | `SOBL` | `track.sol` | Solid Scenery Placements & World Geometry | `0x0006A2AB` via `call 0x000826B0` |
| `0x56414C54` | `VALT` | `track.val` | Global Track Tuning & Lookahead Table | `0x0006A266` via `call 0x0002E4B0` |
| `0x494C494E` | `ILIN` | `*.ild` | AI InterLine Spline Centerlines | `0x00036D70` via `call 0x000358C0` |
| `0x56414C54` | `VALT` | `c_*.va0` | Event-Specific Layout & Object Scripts | `0x0006A290` via `call 0x0002E4B0` |

### 3.1 Binary Collision Tree (`track.bsc`)
The physics engine tests all vehicle wheels, chassis rays, and bounding boxes against `track.bsc`:
- **Collision Nodes**: Form a hierarchical spatial bounding hierarchy. In `Baxter.trk`, there are 5,455 leaf collision polygons.
- **Surface Material Attributes**: Every collision face encodes a material ID defining surface friction:
  - Material 0: Dry Asphalt ($\mu = 0.95$)
  - Material 1: Compact Dirt / Clay ($\mu = 0.85$)
  - Material 2: Wet Mud / Slush ($\mu = 0.55$)
  - Material 3: Grass / Turf ($\mu = 0.65$)
  - Material 4: Wall / Concrete Barrier (inelastic collision, high stiffness)

### 3.2 Visual Scene Graph (`track.grf`)
Contains the full 3D visual geometry rendered by NV2A/Metal:
- Submesh groupings by material shader and texture assignment (`.tex` files from `game/data/common.res` and venue-specific textures).
- Multi-texturing for mud splatters, skidmarks, and trackside banners.

---

## 4. Contest Layout Configurations (`*.va0`)

Each event mode loads a specific `.va0` layout file from the track archive, dynamically reconfiguring the venue geometry and entity population without changing the base track mesh.

### 4.1 Sample Layout: `c_battle.va0` (Battle Mode Arena Setup)
Extracted from `Baxter.trk`:
```text
respawn
  @a $0000$a pt 54.0, 50.51 dir -.78, -.63
  @b $0001$b pt -53.8, 57.22 dir .6, -.8
  @c $0002$c pt -60.45, -115.34 dir .58, -.82
  @d $0003$d pt -56.18, -53.28 dir .64, .77
  @e $0004$e pt 36.48, -41.84 dir -.71, .7
  @f $0005$f pt 87.27, -64.38 dir -.05, -1.0
objects
  @object $0006$object dyno arrow_wall unfloat_frame64 SHaap6myyd3Eof0.w,c
```

### 4.2 Sample Layout: `c_demo_derby.va0` (Boundary Polygon)
Demolition derbies enforce strict boundary perimeters to determine ring-out penalties or contain the cars:
```text
ringout
  bound0  -89.778, -41.138
  bound1  -89.755, +0.912
  bound2  -89.451, +47.458
  bound3  -27.942, +46.894
  bound4  -23.140, +42.369
  bound5  -23.880, -36.324
  bound6  -25.890, -41.916
  ...
```

### 4.3 Static vs. Dynamic Entity Declaration
- **`dyno` Prefix**: Objects instantiated with the `dyno` tag (e.g. `dyno cone`, `dyno fun_barrel`, `dyno arrow_wall`) are dynamically allocated as rigid bodies in the physical simulation world, capable of moving, tumbling, and interacting with car bumpers.
- **Static Scenery**: Objects without the `dyno` tag (e.g. `Hay_Bale4`, tire barrier stacks, wooden fences) are compiled into the static collision tree (`track.bsc`) and do not move.

---

## 5. Hub World Architecture (`HomeBase.trk`)

The Hub World is the centerpiece of TDEOD's career mode:
- **Scope**: Contains the rural town, Eve's diner, the junkyard repair yard, and the connecting arterial highways leading to all 15 venues.
- **Sub-Layouts**:
  - `c_home.va0`: Free-roam initialization, civilian car traffic density, and shop triggers.
  - `c_gate1.val` & `c_gate2.val`: Venue access roadblocks. When a player has not unlocked a racing tier, heavy wooden/concrete barricades block the exit roads leading out of town.
  - Highway Splines: `hiway.ild`, `malt_road.ild`, `train_road.ild` dictate civilian traffic behavior.
- **Out-of-Bounds Reset Triggers**: `Trigger_ResetVehicle` oriented bounding boxes are placed along highway shoulders and entrance ramps. If a car's center of mass enters this volume during an unauthorized event, it is forcibly repositioned back onto the road.
