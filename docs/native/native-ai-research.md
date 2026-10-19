# Native Battle AI research and integration handoff


:::note Source and evidence
Native PS2 investigation evidence. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `work/native-ai-research.md` in `investigation session`. Repository HEAD: `session working notes`. Working-copy modifications: `yes`. Source SHA-256: `1ebc20b142540e583985717884ade29c6489f9378b5495a93e11000847c55906`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## Player success and status

Success means local Battle with two humans visibly retains both native controls and adds two distinct opponents that drive, attack, shoot, die and respawn; countdown, pause, scoring and the five-kill finish continue normally. Evidence still needed: a rendered two-controller match with those outcomes, restart and return-to-menu, plus solo Battle and four-human regressions. More than four Battle participants is a separate structural change.

This investigation verified native code statically in the owner-provided `SLUS_209.10`, generated `gen/rec_*.c`, and `.venv/bin/python tools/dis.py -f ADDRESS`. No game, build or test was run by this agent. Repository `AGENTS.md`, player-success handoff guidance and existing gameplay notes were read. Existing native code is the reused wheel; it precisely matches this game's EE object layouts and lifecycle. The prior gameplay notes contain inaccuracies identified below.

Parent initially authorized research only, then assigned three new integration files. Created `src/battle_bots.cpp`, `src/battle_bots.h`, `tests/battle_bots_test.cpp`; parent owns build/config/HLE integration and separate driver implementation. No existing production/test source was edited here.

## Situation / Task / Action / Result

- Situation: Battle's native participant builder can create valid AI records, but the arena-driver factory has no Battle case and weapon creation explicitly excludes AI.
- Task: find narrow construction hooks and a safe driving path without bypassing human or native vehicle lifecycle.
- Action: traced contest count -> DAVMap -> description -> car/driver and weapon factories, BattleMaster phases, DemoDerby dependencies and route AI dependencies. Added construction-only bridges with synthetic boundary tests.
- Result: count/weapon bridge implementation is ready for parent integration; static findings are verified, runtime success remains unverified. Native Derby cannot be safely substituted solely by changing a vtable/factory because Battle has no initialized boundary. Parent chose a Battle-specific NullDriver update hook retaining native AI LocalCar lifecycle.

## Valid participants before allocation

`0x0012C158(contest*)` is the desired-car-count function. It reads contest+0x10, native human count through `0x0012A270` (global `0x00439858`), and cap table `0x003F0910` = {99,10,4,4}, indexed by humans-1. The normal result is clamp(max(humans, requested), cap), with the native humans>=cap branch returning cap. It does not inspect event type.

A narrow Battle-only wrapper can call the original, then return 4 if `contest+8 == 0x18000224`, BattleBots is enabled, and humans is 1..4. This acts before identity/resource allocation. Never simply increase description+0x98C after construction or append empty/duplicated human records.

Native chain:

1. `0x0012AEF0(outDAVMap, contestID, sourceDAVMap, extra)` calls 12C158 at **12AFB0**. Wrapper12AEE8 sets extra=0. There is no Battle-specific AI suppression or count override. Special home-event comparison is 0x08000226, not Battle. Final desired count is written to DAVMap+0 and +0x7C at **12B8B8..12B8C4**.
2. `0x00111E10(description,DAVMap)` copies DAVMap+0x7C to description+0x98C, driver IDs from map+4+i*4 to record+0x68, vehicle IDs from map+0x80+i*4 to record+0x6C. Records start description+0x2C, stride0x78. It tails into1116E0.
3. `0x001116E0` resolves driver12A560/vehicle12A460 identities and fills names, model/resource information and properties. At **11179C..1117A0** it defaults type at record+0 to **0x51 AI**. Matching native human driver IDs through12A220/13D460 changes type to **0x50 Human** and assigns pad index to low two bits of byte record+0x70 at **1117C8..1117DC**. AI is determined by type, NOT slot order, viewport count or +0x70. Bit4 of that byte is used separately.
4. `0x00112D48` does asset prep112A70,111E10, then car resource loading. Normal session120650 calls120940 description setup then112D48. `120940` writes contest event type to description+0x9A4 and contestID to+0x9D0.
5. World car-scene builder `0x0020FD48(description)` loops description+0x98C and consumes the completed0x78-byte records.

Human count during allocation is `0x00439858`; viewport count `0x003C41AC` is set later and must not be treated as reliable identity. The bridge exposes `battle_bots_is_ai_slot(slot)` from exact post-construction0x51 types, restricted to slots0..3, active Battle and configuration.

## Native allocation and driver selection

AI LocalCar factory `0x001384C0` obtains config0x4472F0 through176768 and current object through179AE8. If current object's+0xD8 byte has bit4, it chooses ParkDriver138608. Otherwise config+0x14 event flags choose:

- bit0x100: allocate0x2CC and construct route AIDriver1921C8;
- bit0x200: arena driver factory138288(event);
- otherwise NullDriver138680.

It wraps the result in LocalCar(ai), allocation0x1C34, constructor1A2FE0. Parent independently confirmed LocalCar controller pointer+0x1C1C. **138288 has no Battle0x18000224 case**; its unknown path warns `WARNING: No arena driver for type 0x%x` (string3F2EE0) and returns NullDriver138680. NullDriver allocates4 bytes with vtable3F2FB0. Do not run HumanDriver against this object.

HumanDriver18F2A8 is1153 native instructions and extends through1904xx; it does not end at18FBA0. It owns native countdown/death/input/gear behavior and its tail1903F0..190418 invokes car+0x260 virtual+0x2C. Its weapon input calls17DE78(slot,0), queries pad virtual+0x2C and calls weapon virtual+8. Preserve the entire original function for every Human record. HumanDriver uses car+0x38, slot+0x40; Derby uses a different layout.

## Native weapons and safe reuse

At **210000..210008**, world car builder20FD48 requires record type0x50. It then calls2CE180 at210010 (currently a stub returning0), and only if zero calls **227EE8(ownerSlot)** at210028. Thus native AI0x51 gets no chicken weapon.

`0x00227EE8` is a tail-jump wrapper to **227CA0(ownerSlot)**; `dis.py -x` misses this because it only reports JAL. The constructor:

- gets car scene from `0x003D1C90[owner]`; returns if absent;
- derives launch offsets from car model bounds via21C658 and34CB98;
- builds the native0x40-byte BALL definition (owner+0x18, projectile type+0x30, offsets+0x34/+0x38/+0x3C);
- allocates scene0x54, calls227F38, uses vtable408A48, loads `boomchik.mod`, sets type1;
- calls213578 ->1758B8, creating physical Ball through17DFA8 and initialization virtual17EA10;
- registers scene through2110D8. Scene registry is0x3D20A8[owner], count0x3D20F8.

17EA10 registers **Ball+0x1DC weapon-interface pointer**, owner from Ball+0x1E8, slot0 using17DE30. Registry0x3CE3F8 consists of sixteen0xC-byte records {owner,weaponSlot,weaponPtr}; count is0x3CE4B8. 17DE78 returns the interface, NOT the physical Ball pointer. Do not allocate raw Ball and bypass17EA10/scene ownership. 227B18 is analogous plain-ball constructor but native Human creation uses explosive chicken227CA0.

Bridge post20FD48 calls native227EE8 once per actual AI record with existing car scene and no existing weapon scene/registry. It preserves the original function's full EE return state around calls and the native suppression gate. Both world pointer arrays (`0x495CB4`, `0x495CB8`) are allocated0x12C0 bytes at20E5B4/20E5CC (1200 entries).2110D8 appends without bounds checks; bridge checks both counts0x495CAC/0x495CB0 and registry capacity before each call.

This adds construction only. Weapon ticking, cooldown, detonation and cleanup stay native. Bot trigger code must use interface virtual+8 with car and native trigger struct, obey release-to-rearm, and never double-tick weapon physics.

## BattleMaster lifecycle and four-slot limit

Active master global0x3CF194; event0x3CF19C; event-start gate0x3CF198. Battle factory167F30 allocates0x5AC and calls166C60; its vtable is3F7770.

| Vtable offset | Function | Role |
|---|---|---|
| +0x08 |166D80|destructor|
| +0x0C |167D58|phase1 scoring/finish update|
| +0x10 |166DA0|reset phase0 and per-participant states|
| +0x18 |167FE0|start: master+4=1|
| +0x24 |167FC8|active query: phase==1|
| +0x40 |166E00|HUD|
| +0x60 |166F48|death/kill callback|
| +0x64 |167C70|initial spawn transform|
| +0x68 |1671E8|respawn tick|
| +0x74 |167238|standings serialization|
| +0x7C/+0x80 |167F98/167F90|set/clear master+0xC|

1678A8 copies description+0x98C to master+0x5A8 without clamping. It copies record+0x70 low2 bits to each Battle record+0 (master+0x454+i*0x50): this is pad/identity metadata, not an AI flag. Exactly four records fit before ranking array master+0x594 (four ints), respawn index+0x5A4 and count+0x5A8. **More than four corrupts this layout.** Global car lookup179A08 is an unchecked0x447458[i]; it is not evidence that the entire engine only supports four cars. Other native arrays have20 entries.

Phase0->1 is native **1DA618**: stores1 at3CF198 then calls master virtual+0x18. Only JAL caller is1B88E0 at **1B8E68**, after native countdown/start logic resets each car tracking object through1B94B0. Native preceding gates at1B8D7C..1B8DCC include current object+8==global485288, global4850A4 nonzero,176798()==2 and3CDA8C==4850A8. For historical solo phase0, trace those gates and1DA618, then167FE0. No evidence establishes a wrong vtable call; bypassed HumanDriver/countdown lifecycle is a plausible cause, not proven. Do not force phase1 each frame.

Generic active query1DA528 checks non-null master and global3CF198 before virtual+0x24. Battle's active query does not check individual death state; bot code separately needs master+0x458+i*0x50.

166F48 marks victim record+4 (master+458) dead, timestamps+8 (45C), increments victim deaths+0x10 (464), increments attacker kills+0xC (460), or suicide penalties+0x14 (468). Scoring167D58 checks kills minus suicide penalties >=5 in phase1, changes phase2, sorts167658 and calls201938 scoreboard. The existing doc's +468='deaths' label is inaccurate.

1671E8 respawns after timestamp+2 &lt; native clock3CDACC.1675C0 clears death, resets controller via car+260 virtual+38, calls car reset189F50, selects spawn1673B8, sets transform via car+98 virtual+50, and calls201848. Preserve all these native calls.

## DemoDerby reuse: what is safe and what is missing

DemoDerbyDriver factory13FA20 allocates0x40; base197890 registers it in global482698 (count+0x50). Vtable3F4068:

- +8 destructor142D30;
- +0xC SetCar142D10: slot=car+1DC ->driver+2C, car ->driver+30 and+18, enabled+34=0, car+1BE4=1;
- +0x2C connect142CD8: enabled+34=1 and virtual+38 reset;
- +0x38 reset142BF8; +0x48 collision142C58; +0x58 DriveUpdate142418.

142418 returns when disabled and uses1DA528. Native target selector145498 chooses approximately30% random boundary points versus active non-self opponents; total opponent count comes through213260 from world495D80+1774. It uses driver+14 target slot, modes2/3 and native reverse/recovery/control behavior. Control setters include18AA30,18AA28,18AA50 gear,18AA70 throttle,18AA68 brake,18AA78 steer,18AA60 handbrake.

**Critical missing dependency:** driver reads global boundary0x3CD580, point count+0x800, x/z point entries of8 bytes, and center3CD208. At142604 and1454DC it dereferences the boundary;142798 calls151878 point-inside.

Containing master constructor **13F3F0** (DemoDerby/Football path) initializes it at **13F660..13F6A0**:151BA0("bound"), store3CD580 at13F680,151958(description+9D0,2),151408(outVec2,bound) ->3CD208. KillDerby factory13F780 has similar bound/ringout loads. Battle166C60 DOES NOT call this or a Derby base initializer: it only sets cheats,1678A8 participants,151768("battle","respawn"),167A88 respawn parse and166DA0 reset.

151BA0 looks in table `arenabnd`; missing `bound` logs and allocates an **empty0x804 boundary with count0**. A non-null pointer is insufficient and a pointer left by a previous event is unsafe. Valid reuse requires current-layout provenance, count at least3 and &lt;=256, finite points, native center initialization and matching cleanup; no static proof current Battle layout supplies such data was found. 151958 initializes placement globals3CD650 from contest properties `arena_place_a`/`arena_place_b`, not merely a trivial bound ownership setter.

World construction ordering20E360 is master1D99A8 at20E680,137BB8 AI setup at20E690, track210DC8 at20E6AC, car scenes2100C0->20FD48 at20E6B4/210440. Thus a future factory hook can be arranged after master construction, but it still must obtain valid current-level boundary data. Never swap HumanDriver object/vtable with Derby: their object layouts differ.

## Route-driving alternative

Factory1386F8 directly allocates AIDriver0x2CC, constructor1921C8/vtable3FA928. But constructing it is not sufficient: SetCar/route preparation must initialize car+224 and path-related pointers+160,+164,+280. Connect1922A0 enables helpers1982E0/1982D8/1982D0 then calls reset1926E8, which dereferences those path structures. A Battle map with no usable route cannot safely use the route driver by event flag alone.

Route update193718 includes vengeance checks at193B14..193B24 (cheat master and0x20, driver target+27C>=0); collision handler1985A0 records a retaliation target under collision conditions. This is route-AI retaliation, not evidence that toggling vengeance makes DemoDerby universally chase the human. Native geometry13F1E8(targetXZ,speedPtr,car,boundOptional) computes pursuit/reverse steering, but is not a complete pathfinder or lifecycle.

## Concrete integration and next decisive tests

Ready hooks:0012C158 ->original then Battle-only desired4;0020FD48 ->original then exact-AI native weapon setup. Parent should register these as orig-preserving HLE wrappers, compile src/battle_bots.cpp, and integrate battle_driver_reset from its separate file. Test target needs tests/battle_bots_test.cpp +src/battle_bots.cpp and include dirs src/runtime/runtime/include; test defines its own Config constructor/global and driver-reset stub, so do not link config.cpp or battle_driver.cpp. Tests were authored but **not run** due explicit no-build/game coordination.

Parent's selected driving fallback hooks NullDriver update139230 only for controllers owned by exact AI cars in Battle, retaining native LocalCar update timing. This is a new policy implementation informed by native pursuit/reverse behavior, not claimed to be the original Derby driver. Guard phase1, started, native pause/countdown and dead states; preserve native car/weapon lifecycle and all HumanDriver calls.

Decisive runtime checks: 2-human description has four valid distinct driver/vehicle records with types50,50,51,51 (interleaving should also work); four physical and scene cars, four weapons with correct owners, phase0->1 through1DA618, bots steer/ram/fire/rearm without extra simulation ticks, humans1/2 fire normally, death/respawn/scoring intact, pause freezes them, restarting resets host AI state and weapon counts, exiting/reloading does not duplicate scene/registry ownership. Keep Battle capped4 until master records/rankings/HUD/spawn selection and identity assumptions are expanded deliberately.
