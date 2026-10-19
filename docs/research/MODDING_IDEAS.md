# Modding Ideas — Backlog (after 1:1 parity only)


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/MODDING_IDEAS.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `a6bd37ea8a5a80f0f49eb9e1bfbf673c38b87ccf024022a527140d33272c85cd`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


> **Gate:** none of this starts until the game runs 1:1 with the Xbox original
> (GOALS.md Definition of Done) and the 2-player split-screen pass requirement
> (GOALS.md §0) holds. Every item is opt-in and must leave the default game
> byte-for-byte faithful. Recorded from the owner, 2026-10-16.

## 1. Visual and performance

- **High-refresh carnage (120 FPS+).** Collisions, sheet-metal deformation,
  tire-barrier bounces and crossover jumps stay fluid — no sixth-gen frame-rate
  chug or motion blur. (Needs physics decoupled from render rate, so the
  simulation still ticks exactly as the original.)
- **True modern displays.** Clean 16:9, 21:9 ultrawide and multi-monitor
  panoramic views from the 4:3 original, with the HUD pinned to the periphery
  instead of stretched over the track.
- **CRT or razor-sharp 4K.** Toggle between high-resolution clarity (filtered
  textures, uncompressed audio) and an authentic early-2000s tube-TV filter
  (glow, scanlines).

## 2. Unrestricted chaos — lifting the 12–16 car caps

- **32–64 car Suicide Races:** clockwise into ~30 counter-clockwise oncoming
  cars; surviving one lap is an achievement.
- **Infinite Figure-8 crossover:** ~40 cars so the intersection is never empty;
  timing gaps, sacrificing bumpers, using rivals as shields against T-bones.
- **Multi-trailer road trains:** chain several trailers (e.g. a wagon towing
  three campers) that whip, disintegrate, or decouple into rolling roadblocks.
- **Full-scale School Bus & Hearse Gauntlets:** one fragile subcompact versus
  ~30 police cruisers, hearses and buses trying to pin it before three laps.
- **True survival derbies:** dozens of cars; early rounds about radiator
  conservation and reversing, picking off stragglers late.

## 3. Physical permanence and track hazards

- **Persistent debris fields:** hoods, bumpers, mufflers and wheels never
  despawn; by lap 15 debris punctures tires, upsets suspension and deflects
  drifting cars.
- **Permanent car graveyards:** dead cars stay where they died, building
  chokepoints and pileups on the racing line.
- **Progressive mechanical attrition:** no hood → exposed radiator; front taps
  cause steam, rising temperature and sputtering power, pushing players to
  fight in reverse.

## 4. LAN and modern multiplayer

- **No split-screen sacrifices:** full-screen derbies with friends over a home
  network or virtual LAN tunnels, at full fidelity with no input delay.
- **Wrecked-car spectator cams:** free-cam, ride-along in a survivor's cockpit,
  or an arena broadcast angle after your car dies.
- **House rules:**
  - *Reverse Only* — forward gears disabled.
  - *Glass Cannon* — double engine power, one-hit terminal damage.
  - *Juggernaut* — one armored school bus hunting fragile hatchbacks.
  - *Chain Gang* — pairs of cars bound by a simulated tow cable.

## 5. Stock-car and dirt-track sandbox

The engine is a sibling of Monster Games' *NASCAR Heat* and *NASCAR: Dirt to
Daytona*, so content can cross over:

- **800 hp stock cars in the dirt:** Winston Cup cars and Dirt Late Models in
  muddy Figure-8s and demo arenas.
- **Demolition beaters at Bristol and Daytona:** wagons, vans and buses pack
  racing on 33° banking, crumpling and blowing tires at 140 mph.
- **Famous short-track imports:** Eldora, Knoxville and local bullrings for
  no-rules night races under floodlights.
- **Endless junkyard career:** rescue rusted chassis from an interactive scrap
  yard, weld roll cages, swap engines from wrecked donors, and limp a battered
  car through a whole season.
