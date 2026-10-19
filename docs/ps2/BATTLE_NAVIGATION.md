---
tags: ["cars", "combat-and-ai", "ps2", "technical-reference"]
---
# Experimental Battle navigation


:::note Source and evidence
PS2 implementation notes. Preserve each claim’s original evidence limits. Static disassembly, CPU tests, proposals and live gameplay validation are different evidence levels. See [Battle recovery](/ps2/BATTLE_RECOVERY) for the current native weapon contract.

Source: `docs/BATTLE_NAVIGATION.md` in `eod-recomp`. Repository HEAD: `26dcfb108ab4c0b0ffacf9fba915417acd65a52e`. Working-copy modifications: `no`. Source SHA-256: `b2c8fd4d480e54b6f9ce5e9efaed5d37f2d7b17d5094c5683b794d95c1854318`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


## Player acceptance

A bot must pursue a moving opponent around track obstacles without abandoning
its human controllers or native weapon, damage, scoring and respawn lifecycle.
A usable result requires rendered movement on the named track plus native
state showing progress, attacks, recovery and a completed five-kill match.
A racing-line waypoint or a passing CPU fixture does not prove obstacle clearance.

## Reused native course

The implementation in `src/battle_navigation.cpp` reads the loaded native
primary course. It does not create an arena, move track geometry or invent a
collision-query ABI. `docs/BATTLE_RECOVERY.md` records the prior-art review:
Road Trip Adventure's deterministic scripted-input/capture method is reused;
its different game structures cannot supply EOD navigation or collision calls.
A fresh source check at pinned revision
`0f6d3613e8e32ccda5305227a578b1fb659983a8` inspected the repository tree,
[`Driving.cpp`](https://github.com/silentsudin/RoadTripAdventure-recomp/blob/0f6d3613e8e32ccda5305227a578b1fb659983a8/src/game/Driving.cpp)
and [`overrides.cpp`](https://github.com/silentsudin/RoadTripAdventure-recomp/blob/0f6d3613e8e32ccda5305227a578b1fb659983a8/src/game/overrides.cpp).
The relevant wheel there is native player-controller interception with
script/analogue-input separation (controller `0x0021A820`), not an EOD course
reader or obstacle-query ABI. Reuse the interception/test principle; do not
copy its controller address or invent compatible collision structures.

The cache at EE `0x003CD190` has up to three 12-byte records, followed by its
count at `0x003CD1B4`. Only a unique active type `0x101` record is accepted.
Its relocated resource must have tag `0x104F128B`, header size 48 and node size
60. Primary count is the high halfword of `+0x1C` (halfword `+0x1E`); root is
`+0x20`. Nodes are contiguous: X/Z position at `+0/+4`, X/Z tangent at
`+8/+0xC`, next pointer at `+0x14`, and section length at `+0x18`.
**Node `+0x10` is packed metadata, not a previous pointer.**

Native `0x0013AF20` indexes this primary array modulo its count;
`0x00139B60` steps backward by 60 and wraps at that count. Secondary branch
lists at node `+0x38` are deliberately excluded. Reinspect these guest addresses
in locally generated source/disassembly; no retail code or resource is committed.

Pointers/spans, count, resource identity, ownership, finite coordinates, lengths
and closed next links are validated. Missing, malformed, ambiguous or unowned
resources discard the cached course and use direct pursuit. Event construction
resets navigation state. A stable resource identity reuses its validated snapshot.

## Policy and limits

The car and opponent project onto primary course segments. Within 35 world
units of both projections, a bot follows a shorter course arc using bounded
lookahead and direction hysteresis. Near opponents on the same local section
use direct interception. At crossings, the car's heading helps disambiguate
projection; this does not establish a traversable connection between branches.
Only steering aim and the turn-speed limit use the waypoint. Native weapon aim,
range and elevation still refer to the actual opponent.

This is **course following plus direct pursuit**, not general pathfinding.
It cannot check a segment for walls, choose native secondary branches, route
safely through arbitrary infields or guarantee escape from every pin. Reverse
recovery remains a bounded steering heuristic. Home has no supported primary
course in the baseline capture, so its behavior is direct pursuit/recovery.
All bots remain experimental until the player acceptance above is established
on each relevant map. Unlocking a map does not certify navigation there.

## Solo map decision

Do not claim that map size determines eligibility. A small arena can have
impassable barriers; a larger oval can provide a useful native course. Keep
solo exposure bounded to existing native Battle descriptors and safe native
menu capacity. The current 312/320 contest occupancy leaves eight additions:
Anoka, Ashland, Baxter, Dennison, Dundas, Eagan, Gilroy and Hampton. This is a
capacity policy, not a tested small-track allowlist. Home/Mankato/Woodly remain
native multiplayer selections; unlocking them does not expand the solo table.
Safe per-map eligibility needs full chase/completion evidence before widening
solo exposure or claiming any current map to be fully validated.

## Reproduction and diagnostics

Run games and builds sequentially, muted and headless. With an owned installed
disc, the authored harness saves isolated configuration, memory card, exact
controller scripts, captures, native trace and final RAM under ignored `work/`:

```sh
tools/test_battle.sh "$DISC" mixed work/battle-home 12000 Home
tools/test_battle.sh "$DISC" mixed work/battle-woodly 12000 Woodly
tools/test_battle.sh "$DISC" mixed work/battle-dennison 12000 Dennison
python3 tools/analyze_battle_trace.py work/battle-woodly --output work/battle-woodly/summary.json
```

The harness sets `EOD_HEADLESS=1 EOD_MUTE=1`, `--headless`, 1x Vulkan,
FrameSkip=0 and native blast multipliers. `EOD_BATTLE_TRACE` opts into sampled
`BATTLE_ROUTE` lines with `course`, `routing`, opponent and slot. This records
whether course following actually ran. Require the matching loaded `.trk`
resource and rendered menu label, rather than trusting the output directory.
Sampled firing transitions and low-progress intervals are evidence summaries,
not exact shot counts or a collision/acceptance oracle. Capture inspection and
native phase/score/lifecycle state remain necessary.
