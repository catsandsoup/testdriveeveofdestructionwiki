---
tags: ["engine", "modding-and-formats", "cross-platform", "historical"]
---
# Granular Specifications: 5 Engine Limitation Overhauls


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. Static disassembly, CPU tests, proposals and live gameplay validation are different evidence levels. See [Battle recovery](/ps2/BATTLE_RECOVERY) for the current native weapon contract.

Source: `docs/wiki/engine_overhauls_specs.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `12655f3348705ae2d5f8e8ab1330b1b5d0de6430d6627e25afa5a6e9b40930be`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


By recompiling the *Test Drive: Eve of Destruction* engine natively in 64-bit C++, the strict memory budgets of the PlayStation 2 (32MB) and Xbox (64MB) are eliminated. Below are the technical implementation blueprints for the five major engine limitation overhauls.

---

## Overhaul 1: The Infinite Junkyard (Debris Persistence & Infinite LOD 0)

### 1.1 The Vanilla Problem
In retail TDEOD:
- Detached car parts (hoods, bumpers, doors, wheels) blink out of existence after **~5.0 seconds** (300 physics ticks).
- The rigid body collision pool had a hard ceiling of **32 to 64 active dynamic objects**.
- The camera swapped to medium-poly (`Low2.mod`) at 15 meters and low-poly cardboard (`Low4.mod`) at 30 meters to stay within GPU vertex memory limits.

### 1.2 Modern Recomp Implementation
```cpp
// 1. Permanent Debris: Disable Despawn Timers in 0x00100F10 / 0x0006BC20
void Hook_DetachedPart_Update(DetachedPart* part) {
    // Vanilla:
    // part->ttl_ticks--;
    // if (part->ttl_ticks <= 0) part->Despawn();

    // Modern Recomp: No TTL decrement! Debris remains permanently on track.
    part->ttl_ticks = 0x7FFFFFFF;
}

// 2. Dynamic Pool Expansion: Replace Fixed Pool with Scalable Dynamic Vector
class ModernPhysicsWorld {
    // Vanilla: RigidBody* m_pool[64];
    std::vector<std::unique_ptr<RigidBody>> m_dynamic_rigid_bodies; // Supports 4,096+ bodies
};

// 3. Infinite LOD 0: Override Camera Distance Evaluator in 0x000A2710
int Hook_EvaluateModelLOD(Car* car, float camera_distance) {
    // Vanilla: return lod_table.Evaluate(camera_distance);
    // Modern Recomp: Always render Low0.mod (Cockpit/Full Detail Exterior)
    return LOD_LEVEL_0;
}
```

### 1.3 Gameplay Impact
In a 30-lap Enduro, the track transforms into a treacherous battlefield of twisted metal, severed axles, and loose wheels. Cars hitting an engine block or detached wheel at 80 mph suffer suspension damage, forcing racers to navigate dynamic debris fields.

---

## Overhaul 2: Dynamic Track Perimeters (Physics Scenery & Breakable Barriers)

### 2.1 The Vanilla Problem
Trackside obstacles (hay bales, tire stacks, concrete barriers, wooden posts) were compiled directly into the static BSP collision tree (`track.bsc`). Hitting a hay bale acted like hitting a solid brick wall.

### 2.2 Modern Recomp Implementation
```cpp
// 1. Scenery Asset Registry Intercept
void Hook_LoadSceneryObject(SceneryEntry* entry) {
    if (entry->is_hay_bale || entry->is_tire_stack) {
        // Strip static flag
        entry->is_static = false;

        // Allocate dynamic rigid body with realistic physical mass
        RigidBody* body = new RigidBody();
        body->SetMass(entry->is_hay_bale ? 75.0f : 120.0f); // kg
        body->SetRestitution(entry->is_hay_bale ? 0.15f : 0.65f); // bounciness
        body->SetFriction(0.85f);
        body->SetCollisionHull(entry->convex_hull);

        g_physics_world->AddRigidBody(body);
    }
}

// 2. Concrete Barrier Force-Break Threshold
void Hook_WallCollision_ResolveImpact(CollisionContact* contact, Car* striker) {
    float impact_kinetic_energy = 0.5f * striker->mass * striker->velocity.LengthSquared();
    const float BREAK_THRESHOLD_JOULES = 180000.0f; // High kinetic threshold

    if (contact->is_concrete_barrier && impact_kinetic_energy > BREAK_THRESHOLD_JOULES) {
        // Despawn static wall segment from BSP tree
        contact->wall_entity->RemoveFromBSPTree();

        // Spawn 4 to 5 fractured physics concrete chunk models
        for (int i = 0; i < 4; i++) {
            Vector3 chunk_pos = contact->position + Vector3((i-2)*0.6f, 0.2f, 0);
            Entity* chunk = SpawnDynamicObject("concrete_chunk.mod", chunk_pos);
            chunk->rigid_body->SetMass(350.0f); // 350 kg per block
            chunk->rigid_body->ApplyImpulse(striker->velocity * 40.0f);
        }
    }
}
```

---

## Overhaul 3: The "Eve’s Diner" Cannonball Run (Open-World Track Merging)

### 3.1 The Vanilla Problem
During career mode, the open-world Hub World (`HomeBase.trk`) loaded separately from race venues (`Baxter.trk`, `Dundas.trk`). When races started, exit roads were blocked with concrete barricades and `Trigger_ResetVehicle` out-of-bounds bounding boxes.

### 3.2 Modern Recomp Implementation
```cpp
void Load_CannonballRun_MergedWorld() {
    // 1. Load Hub World Town geometry into active scene graph
    g_scene_graph->LoadArchive("HomeBase.trk");

    // 2. Load Baxter Speedway and Dundas Trail meshes simultaneously
    g_scene_graph->LoadArchiveIntoWorld("Baxter.trk", Vector3(1200.0f, 0.0f, -450.0f));
    g_scene_graph->LoadArchiveIntoWorld("Dundas.trk", Vector3(-800.0f, -50.0f, 1500.0f));

    // 3. Remove all Gate 1 and Gate 2 roadblocks
    g_scene_graph->RemoveEntityByName("c_gate1");
    g_scene_graph->RemoveEntityByName("c_gate2");

    // 4. Delete Trigger_ResetVehicle out-of-bounds bounding volumes
    g_trigger_manager->DisableAllResetVolumes();

    // 5. Connect Highway splines directly to Track entrance splines
    g_ai_spline_network->ConnectSplines("hiway.ild", "baxter_entrance.ild");
    g_ai_spline_network->ConnectSplines("baxter_exit.ild", "dundas_trail.ild");
}
```

### 3.3 Target Gameplay
A 32-player point-to-point marathon: start in the parking lot of Eve's Diner, blast down the rural asphalt highway, crash through the gates of Baxter Speedway, drift a full lap around the Baxter oval, bust out through the back maintenance doors, and race through the backwoods to finish at the Dundas dirt trail!

---

## Overhaul 4: Dynamic Shortcuts & Campaign Breaches

### 4.1 Concept & Mechanics
Specific track perimeter walls (such as Turn 3 in Mankato, leading to the car dealership alleyway from career mode) are scripted as destructible high-threshold barriers:
- Lighter cars bounce off harmlessly.
- Heavy vehicles (Ambulance, Hearse, Bus) possess sufficient kinetic energy to shatter the barrier, blowing a literal hole in the map!
- When shattered, the AI route-evaluator dynamically recalculates, allowing both players and computer opponents to utilize the shortcut.

```cpp
void Hook_ShortcutWall_OnDestroyed() {
    g_mankato_turn3_shortcut_opened = true;

    // Notify all active AI drivers to evaluate shortcut spline
    for (Car* car : g_ai_cars) {
        car->ai_driver->EnableAlternateRoute("mankato_alleyway.ild");
    }
}
```

---

## Overhaul 5: Hub-World Infection (The Town is Alive)

### 5.1 Concept & Mechanics
Transforming the peaceful nostalgic campaign hub world into an open-world survival horror demolition arena:
- **Sandbox Boot**: Boot `HomeBase.trk` directly via free-roam event type `0x08000226` (`home` / `"Driving Around"`).
- **Infection AI**: Disable peaceful civilian traffic. Spawn 15 `Hearse.car` AI vehicles driven by `WrangleDriver` (`0x001FE3F0`), actively patrolling highways and dirt trails looking for players.
- **Midnight Atmosphere & Metal Headlights**:
  - Decouple ambient sunlight from campaign clock, setting ambient lighting to pitch-black midnight ($RGB = 0x05, 0x05, 0x10$).
  - Upgrade vehicle headlights in `nv2a_metal.m` to cast real-time projected shadow frustums across the landscape.
  - Players must switch off their headlights when hiding behind barns or gas pumps at Eve's Diner to avoid detection by passing patrol Hearses!
