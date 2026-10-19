# Owner's mod ideas (2026-10-17, condensed from the owner's design doc)


:::note Source and evidence
PS2 implementation notes. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/MODDING_IDEAS.md` in `eod-recomp`. Repository HEAD: `67c972b0fed775994d1769382676bd94ebdc3bc7`. Working-copy modifications: `no`. Source SHA-256: `2d782020f47d36c318eeaa747a049544409984c266043ef31735b20675d01cff`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


Priority set by owner: **LOD first, especially in split screen.**

## Engine upgrades
1. Infinite Junkyard: detached parts (bumpers, hoods, tires) never despawn (remove TTL, bigger debris pool); cars and debris always at full detail (LOD 0) at any distance.
2. Dynamic track perimeters: tire walls, hay bales, fence posts become physics objects; concrete barriers break above an impact threshold.
3. Eve's Diner Cannonball Run: remove event barriers/reset triggers, stitch hub world + tracks, point-to-point races through town and venues.
4. Destructible shortcuts: heavy cars break campaign barriers mid-race; AI uses the opened route.
5. Hub-world Infection: whole town at night, headlight-only lighting.

## Game modes (party/multiplayer)
Patient Zero (infection, Hearse horde), Trash Compactor (heavy rolling School Bus vs compacts in the Quarry), Gauntlet Sniper (stationary mortar player over the Figure-8), Ice Rink Sumo (zero-grip arena, push out of bounds), Smokey & the Bandit (cops vs robbers, 3 s pin = busted), The Sweeper (rotating buses, jump cheat), Ejector Seat Bowling (launch chassis for distance), Meat Grinder (ramp over oval infield into oncoming traffic), Arena Combat (crates give mortar/mine), Keanu's Revenge (towed trailers, last place explodes every 20 s), Pinball Derby (bouncy walls x2.5), Shackled Sprint (teams chained 30 ft apart), Red Light Green Light, Quarry Bowling (Ambulance vs parked Taxis), Relic Hunt (collect tokens, AI buses hunt you).

Note: many assume more players/cars than the game's 2P split screen and car limits; these need the engine work above first.
