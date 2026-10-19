# Community Mod Tools Roadmap & Tooling Specifications


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/wiki/mod_tools_roadmap.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `0b0ad69e5cc2586dc49d9757a8530e82bfa4a66c39fa61a435362cdb07ad2881`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


To empower the community to build custom tracks, vehicles, and game modes for the *Test Drive: Eve of Destruction* Recompilation, a dedicated suite of open-source CLI and GUI tools is designed below.

---

## Tool 1: `0tsr_tool.py` (Archive Unpacker & Repacker)

### 1.1 Purpose
Unpacks and repacks Monster Games `0TSR` (`RST0`) archives (`.trk`, `.car`, `.res`).

### 1.2 CLI Usage
```bash
# Unpack Baxter.trk into a directory
python3 tools/0tsr_tool.py unpack game/data/Baxter.trk -o work/mods/Baxter/

# Repack modified directory into Baxter.trk
python3 tools/0tsr_tool.py pack work/mods/Baxter/ -o game/data/Baxter.trk
```

### 1.3 Technical Architecture
- Reads the 32-byte master header (`magic`, `info_offset`, `file_count`).
- Iterates over the 68-byte file entry table (`name`, `file_type`, `decomp_size`, `data_offset`).
- When packing, aligns all file payloads to 16-byte boundaries and writes the updated info offsets.

---

## Tool 2: `val_editor.py` (`.val` & `.va0` Configuration Editor)

### 2.1 Purpose
Decodes and encodes compiled binary `VALT` tables (`physics.val`, `lod.val`, `track.val`, `c_*.va0`) to/from human-readable JSON or plain text.

### 2.2 CLI Usage
```bash
# Decompile Algar physics.val to JSON
python3 tools/val_editor.py decode game/data/Algar/physics.val -o work/mods/Algar/physics.json

# Recompile modified JSON back to binary VALT
python3 tools/val_editor.py encode work/mods/Algar/physics.json -o game/data/Algar/physics.val
```

### 2.3 Parameter Mappings
Allows modifying:
- Vehicle horsepower, torque curve, and gear ratios.
- Vehicle mass, tire grip coefficients, and damage detachment thresholds.
- Track AI lookahead parameters, speed factors, and respawn coordinate arrays.

---

## Tool 3: `mod_converter.py` (3D Mesh Converter)

### 3.1 Purpose
Converts standard 3D asset formats (`Wavefront .obj` and `glTF 2.0`) into Monster Games `.mod` binary containers and vice-versa.

### 3.2 CLI Usage
```bash
# Convert custom car model into Low1.mod
python3 tools/mod_converter.py import my_custom_muscle.obj -o Low1.mod --generate-bounds

# Export Low1.mod to glTF for Blender inspection
python3 tools/mod_converter.py export Low1.mod -o Low1.gltf
```

### 3.3 Conversion Pipeline
- Computes local bounding sphere radius and axis-aligned bounding box min/max extents.
- Formats vertex buffers with $(X, Y, Z)$ coordinates, $(N_x, N_y, N_z)$ surface normals, $(U, V)$ texture coordinates, and ARGB32 ambient occlusion colors.
- Generates 16-bit indexed triangle lists.

---

## Tool 4: `ild_editor.py` (Visual AI Spline Editor)

### 3.1 Purpose
Inspects and visualizes AI centerline splines (`*.ild`) and enables plotting new navigation routes for custom tracks or shortcuts.

### 3.2 CLI Usage
```bash
# Export Baxter oval spline to CSV coordinates
python3 tools/ild_editor.py export game/data/Baxter/oval.ild -o oval_spline.csv

# Compile modified spline coordinates into binary ILIN format
python3 tools/ild_editor.py compile new_shortcut.csv -o shortcut.ild
```
