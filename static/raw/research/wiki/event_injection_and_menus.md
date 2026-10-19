# Event Selection & Menu Injection Architecture: Reverse Engineering Reference


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. Static disassembly, CPU tests, proposals and live gameplay validation are different evidence levels. See [Battle recovery](/ps2/BATTLE_RECOVERY) for the current native weapon contract.

Source: `docs/wiki/event_injection_and_menus.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `d920d6094f1b15f54a27d51b2ad588e268d68ff37cfc84206c1f8190ba9b1b88`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## 1. The Master Event Table

Located at **`0x0021BE78`** in Microsoft Xbox (`default.xbe`) and **`0x003C3A70`** in Sony PlayStation 2 (`SLUS_209.10`).
- **Entry Stride**: 12 bytes (`0x0C`).
- **Structure**:
  ```c
  struct MasterEventEntry {
      uint32_t event_type;       // Event bitmask identifier
      const char* name_id;      // Internal name string pointer
      const char* display_name; // Formatted UI display title pointer
  };
  ```
- **Complete 33-Entry Table Dump**:

| Index | Hex Type | Internal Name | In-Game Menu Display Name | Engine Mechanics Category |
|---|---|---|---|---|
| 0 | `0x00002110` | `"normal_race"` | `"No-Rules Race"` | Standard Circuit Race |
| 1 | `0x00002B02` | `"trailer_race"` | `"Trailer Race"` | Circuit Race + Trailer Hitch Flag (`0x800`) |
| 2 | `0x00008125` | `"chain_race"` | `"Chain Race"` | Paired Vehicle Sprint |
| 3 | `0x00003904` | `"egg_trailer_race"`| `"Egg Trailer Race"` | Circuit Race + Trailer Egg Physics |
| 4 | `0x01002105` | `"figure8_race"` | `"Figure-8"` | Figure-8 Intersection Race |
| 5 | `0x01002906` | `"figure8_trailer_race"`| `"Figure-8 Trailer Race"` | Figure-8 + Trailer Hazard |
| 6 | `0x00042108` | `"fwd_bwd_race"` | `"Forward-Backward Race"` | Half-lap Forward, Half-lap Reverse |
| 7 | `0x02002109` | `"bwd_race"` | `"Backward Race"` | Full Reverse Direction Race |
| 8 | `0x0001210A` | `"suicide_race"` | `"Suicide Race"` | Counter-traffic Head-on Crossover |
| 9 | `0x0010210B` | `"shortcut_race"`| `"Shortcut Race"` | Multi-path Split Road Course |
| 10 | `0x0002210C` | `"flagpole_race"`| `"Flagpole Race"` | Pylon 360-degree Pivot Turn Race |
| 11 | `0x0020210D` | `"reverse_race"` | `"Reverse Race"` | Backward Transmission Race |
| 12 | `0x0000210E` | `"jump_race"` | `"Jump Race"` | Ramp Circuit with Infield Gaps |
| 13 | `0x0100210F` | `"figure8_jump_race"`| `"Figure-8 Jump Race"` | Figure-8 with Elevated Ramp Crossover |
| 14 | `0x00402112` | `"stop_and_go_race"`| `"Stop-and-Go Race"` | Mandatory Pit Stop / Checkpoint Stop |
| 15 | `0x08882213` | `"red_rover"` | `"Red Rover"` | Infield Line Crossing Elimination |
| 16 | `0x00004214` | `"gauntlet"` | `"Gauntlet"` | Armored Car vs Pursuit Beaters |
| 17 | `0x18000215` | `"soccer"` | `"Soccer Match"` | Multi-Car Ball Arena Sport |
| 18 | `0x18800216` | `"king_of_ring"` | `"King of the Ring"` | Arena Zone Hold / Sumo |
| 19 | `0x08000217` | `"pointtopoint"` | `"Point-To-Point Race"` | Open Highway Road Sprint |
| 20 | `0x00082118` | `"last_man_race"`| `"Last Man Race"` | Timed Lap-by-Lap Elimination |
| 21 | `0x00042119` | `"whip_around_race"`| `"Whip Around Race"` | Hairpin Whip Maneuver Race |
| 22 | `0x0880421A` | `"wrangle"` | `"Wrangling"` | School Bus Hunter Pursuit |
| 23 | `0x1800421C` | `"save_ring"` | `"Survival"` | Demolition Derby Infield Survival |
| 24 | `0x1880221E` | `"kill_derby"` | `"Demolition Derby"` | Standard Arena Demolition Derby |
| 25 | `0x0000011F` | `"school_bus"` | `"School Bus Race"` | Heavy Class Only Oval Race |
| 26 | `0x18802220` | `"kill_push"` | `"Push-Off"` | Berm / Cliff Fall Elimination |
| 27 | `0x18802221` | `"kill_knock"` | `"Knock-Out"` | High-Impact Elimination Derby |
| 28 | `0x18006222` | `"capture"` | `"Capture the Flag"` | Arena Objective Flag Run |
| 29 | `0x09002223` | `"detention"` | `"Detention"` | School Bus Arena Gauntlet |
| 30 | `0x18000224` | `"battle"` | `"Battle"` | Demolition Combat with Weapons |
| 31 | `0x08000226` | `"home"` | `"Driving Around"` | Hub World Free-Roam Sandbox |
| 32 | `0x00000127` | `"eve_win"` | `"Eve Win"` | Championship Trophy Celebration |

---

## 2. In-Memory Contest Table (`0x0022EF60`)

The Contest Table is populated dynamically when `sub_00023BF0` parses event schedules:
- **Global Table Base**: `0x0022EF60` on Xbox (`0x003C61A8` on PS2)
- **Active Contest Count**: `0x0022EF54` on Xbox (`0x003C4CF8` on PS2)
- **Maximum Capacity**: 320 contest slots
- **Record Stride**: 40 bytes (`0x28`)

### 2.1 Record Layout (`0x28` bytes)
```c
struct ContestRecord {
    uint32_t global_index;       // +0x00: Global sequential index (0..num_contests-1)
    uint32_t eve_index;          // +0x04: Index into Eve Table (which event series owns this)
    uint32_t event_type;         // +0x08: Event type bitmask (from Master Event Table)
    uint32_t laps;               // +0x0C: Total laps (for circuit races)
    uint32_t max_cars;           // +0x10: Maximum participating cars (typically 4, 8, 12, 16)
    uint32_t terrain_mask;       // +0x14: Allowed vehicle classes / terrain type
    uint32_t rounds;             // +0x18: Total heats / rounds
    uint32_t purse;              // +0x1C: Career prize money payout
    uint32_t name_table_ptr;     // +0x20: Pointer to layout string (e.g. "c_battle", "c_demo_derby")
    uint32_t enabled;            // +0x24: 1 = Active in selection carousel, 0 = Disabled
};
```

---

## 3. In-Memory Eve Table (`0x002336B0`)

An "Eve" represents an entire evening's racing card (e.g. "Baxter Bash", "Mankato Carnage"):
- **Global Table Base**: `0x002336B0` on Xbox (`0x003C4D08` on PS2)
- **Active Eve Count**: `0x0022D968` on Xbox (`0x003C4CF4` on PS2)
- **Record Stride**: 132 bytes (`0x84`)

### 3.1 Record Layout (`0x84` bytes)
```c
struct EveRecord {
    int32_t  eve_index;          // +0x00: Eve ID
    int32_t  league_index;       // +0x04: League tier (0 = Dare, 1..3 = Pro tiers)
    char     track_name[32];     // +0x08..+0x27: Track file prefix (e.g. "Baxter", "Hastings")
    char     display_name[64];   // +0x28..+0x67: UI Title (e.g. "Hastings Mayhem")
    uint32_t reserved[2];        // +0x68..+0x6F: Flags
    uint32_t num_contests;       // +0x70: Number of sequential contests in this Eve
    uint32_t padding[4];         // +0x74..+0x83: Internal state
};
```

---

## 4. Action Carousel UI Loop (`0x00154650`)

When a player selects an event in Arcade or Multiplayer mode, the UI runs `sub_00154560`:
1. It queries the global tracker at `0x002BEDB0` (`EveResultsTracker`).
2. Calls virtual method `[+0x3C]` to retrieve `current_event_idx` and `[+0x2C]` to retrieve `total_events`.
3. Populates the HUD string with format `"Event %d of %d"` (`0x002156A8`).
4. Iterates through the active Eve's contests at `0x0022EF60 + c * 0x28`.
5. Resolves the display string from the Master Event Table for each contest and renders the 3D rotating carousel cards with stride `0x80` bytes.

---

## 5. Non-Destructive Mod Injection Blueprint

To add custom races and game modes into the menus **without modifying any original disc files**:

### 5.1 The Eve Loader Intercept Hook (`sub_00023BF0`)
Place a native C++ hook inside `sub_00023BF0` right before it returns to caller:

```cpp
void Hook_EveLoader_InjectCustomModes() {
    uint32_t* num_contests_ptr = (uint32_t*)0x0022EF54;
    ContestRecord* contests = (ContestRecord*)0x0022EF60;

    // Inject Custom Game Mode: "Patient Zero"
    uint32_t new_idx = *num_contests_ptr;
    contests[new_idx].global_index   = new_idx;
    contests[new_idx].eve_index      = 0; // Available in First Tier / Arcade
    contests[new_idx].event_type     = 0x18000224; // Battle Mode base
    contests[new_idx].laps           = 1;
    contests[new_idx].max_cars       = 16; // Lifted from 4 to 16
    contests[new_idx].terrain_mask   = 0xFFFFFFFF;
    contests[new_idx].rounds         = 1;
    contests[new_idx].purse          = 2500;
    contests[new_idx].name_table_ptr = (uint32_t)"c_patient_zero";
    contests[new_idx].enabled        = 1;

    (*num_contests_ptr)++;
}
```

### 5.2 UI Carousel Registration
Because `sub_00154560` dynamically reads `*num_contests_ptr`, incrementing the count automatically adds the new game mode card into the UI carousel! Players can cycle with D-Pad Left/Right and press A/Cross to launch immediately.
