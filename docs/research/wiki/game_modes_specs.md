# Granular Specifications: 15 Custom Game Modes


:::note Source and evidence
Historical / cross-platform research. This historical / cross-platform source may mix Xbox addresses, PS2 addresses and proposed designs. It is not a verified PS2 implementation contract. Preserve each claim’s original evidence limits. CPU tests, static disassembly, proposals and live gameplay validation are different evidence levels. Consult [current Battle recovery](/ps2/BATTLE_RECOVERY) for corrections and current status.

Source: `docs/wiki/game_modes_specs.md` in `TDEOD RECOMP`. Repository HEAD: `7fba3ecfa0cb11ccdccd991b541bf7da03e82144`. Working-copy modifications: `no`. Source SHA-256: `4e3fbf55ae64196be6915e241eb9b9ea63dac64a655970ea7a8ce36c628c9e32`. Imported 2026-10-19. Addresses belong only to the platform/revision identified in the source; do not transfer Xbox addresses to PS2.
:::


By porting the Test Drive: Eve of Destruction (`TDEOD`) simulation engine to a modern 64-bit C++ architecture, we bypass console memory caps and hijack internal physics, collision hooks, and state machines. Below are the complete technical implementation blueprints for all 15 custom game modes.

---

## Mode 1: Patient Zero (Demolition Derby Infection)

- **Venue**: Mankato Demolition Arena (Night environment).
- **Roster & Spawns**: 15 players in pristine `Durand.car` / `Phantom.car` muscle cars; 1 randomly chosen player in rusted `Hearse.car` ("Patient Zero").
- **Target Gameplay**: Demolition survival. Survivors desperately weave through a growing horde of heavy Hearses. If a Hearse touches your car, you instantly infect into a Hearse.
- **Engine Subsystems Scoped**:
  - Master collision resolution callback (`0x0017B708` / `f_0017B708`).
  - Vehicle visual texture pointer (`car->mesh->material_texture`).
  - Chassis mass factor (`car + 0x1B88`).
  - AI controller replacement (`IDriver` swap from `PlayerDriver` / `AIDriver` to `DemoDerbyDriver`).
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_CollisionResolution(Car* striker, Car* victim) {
      uint32_t striker_id = striker->car_index;
      uint32_t victim_id  = victim->car_index;
      
      if ((g_infected_mask & (1 << striker_id)) && !(g_infected_mask & (1 << victim_id))) {
          // 1. Flip infection status bit
          g_infected_mask |= (1 << victim_id);
          
          // 2. Override visual texture pointer to rust asset
          victim->mesh->textures[0] = g_hearse_rust_texture;
          
          // 3. Boost mass and traction in real-time
          victim->mass_factor *= 1.40f;
          victim->tire_grip   *= 1.25f;
          
          // 4. If AI car, repoint target search to nearest survivor
          if (victim->is_ai) {
              victim->driver = new DemoDerbyDriver(victim, TARGET_SURVIVORS_ONLY);
          }
      }
  }
  ```

---

## Mode 2: Trash Compactor (Speed Halo / Fat Kid)

- **Venue**: HomeBase Construction Pit / Quarry bowl (`HomeBase.trk`).
- **Roster & Spawns**: 15 players at the quarry floor in micro compacts (`Moth.car`, `Cockroach.car`, `Digit.car`); 1 player at the quarry rim in a `Bus.car`.
- **Target Gameplay**: Unstoppable gravitational survival. The Bus has zero engine power, but its weight is increased tenfold. It rolls down the steep dirt cliff, crushing panicked compacts against the pit floor.
- **Engine Subsystems Scoped**:
  - Throttle input suppression (`car + 0x1B7C = 0.0f`).
  - Chassis mass override (`car + 0x1B88 = 50,000.0f`).
  - Localized gravitational vector override.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_TrashCompactor_PhysicsTick(Car* car) {
      if (car->car_index == g_fat_kid_bus_id) {
          // Suppress engine acceleration
          car->throttle = 0.0f;
          
          // Set massive rigid body mass (50,000 lbs ~ 22,680 kg)
          car->rigid_body->mass = 22680.0f;
          
          // Apply localized downward slope gravitational pull
          Vector3 gravity_force = { 0.0f, -35000.0f, 0.0f };
          car->rigid_body->ApplyCentralForce(gravity_force);
      }
  }
  ```

---

## Mode 3: The Gauntlet Sniper (Horn Mortar Duck Hunt)

- **Venue**: Welch Valley Figure-8.
- **Roster & Spawns**: 15 racers racing laps on the Figure-8 track; 1 player parked on an elevated dirt berm overlooking the center crossover.
- **Target Gameplay**: The Sniper cannot drive, but possesses unlimited access to the Horn Mortar (explosive chicken launcher) with zero cooldown, firing into the intersection to blast jumping cars out of the air.
- **Engine Subsystems Scoped**:
  - Vehicle velocity lock ($\vec{V} = \vec{0}$).
  - First-person crosshair raycast camera.
  - Projectile spawner (`0x000A76DB` / `f_0017EC58`) and 65-frame cooldown timer bypass.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_GauntletSniper_Update(Car* sniper) {
      // 1. Lock sniper vehicle in place
      sniper->velocity = Vector3(0.0f, 0.0f, 0.0f);
      
      // 2. Read right-stick aiming crosshair ray
      Vector3 aim_dir = g_camera->GetCrosshairRay();
      
      // 3. Bypass rate limiter
      sniper->weapon_cooldown_ticks = 0;
      
      if (sniper->input->IsFireTriggerPressed()) {
          // Launch Ball projectile along crosshair vector
          Vector3 launch_vel = aim_dir * 60.0f; // 60 m/s muzzle velocity
          SpawnProjectile_Chicken(sniper->position + Vector3(0, 1.2f, 0), launch_vel);
      }
  }
  ```

---

## Mode 4: Ice Rink Sumo (Polar Push)

- **Venue**: Hastings Demolition Arena.
- **Roster & Spawns**: 16 players in heavy `Ambulance.car` or `CopCar.car`.
- **Target Gameplay**: Zero-friction black ice floor. Players must manage sliding momentum to knock opponents over the outer dirt berms into elimination.
- **Engine Subsystems Scoped**:
  - Surface material tire-slip coefficient (`car + 0x1B80 = 0.02f`).
  - Outer arena perimeter elimination boundary ($R = 28.0\text{ meters}$).
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_IceRinkSumo_Tick(Car* car) {
      // Force tire friction to near-zero (black ice)
      car->tire_lateral_grip = 0.02f;
      car->tire_longitudinal_grip = 0.04f;
      
      // Check radial boundary elimination
      float dist_from_center = sqrtf(car->pos_x * car->pos_x + car->pos_z * car->pos_z);
      if (dist_from_center > 28.0f) {
          car->damage_ratio = 1.0f; // Total vehicle
          car->engine_running = false;
          BroadcastElimination(car->car_index);
      }
  }
  ```

---

## Mode 5: Smokey & The Bandit (Hot Pursuit Point-to-Point)

- **Venue**: Dundas Point-to-Point dirt highway.
- **Roster & Spawns**: 4 "Robbers" in fast `Outlaw.car` muscle beaters; 4 "Cops" in sirens-blaring `CopCar.car`.
- **Target Gameplay**: Robbers race from start to finish line. Cops must execute PIT maneuvers and pin Robbers against trees/walls for 3 seconds to eliminate them.
- **Engine Subsystems Scoped**:
  - Team array monitoring.
  - Linear velocity sensor ($\|\vec{V}\| &lt; 0.44\text{ m/s}$ = 1 mph).
  - Spatial proximity detector ($d &lt; 3.0\text{ meters}$) and 180-tick ($3.0\text{s}$) pin counter.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_SmokeyBandit_Tick(Car* robber) {
      if (robber->team != TEAM_ROBBER || robber->is_eliminated) return;
      
      bool is_pinned = false;
      if (robber->velocity.Length() < 0.44f) { // Under 1 MPH
          for (Car* cop : g_cops) {
              if (cop->position.DistanceTo(robber->position) < 3.0f && cop->IsCollidingWith(robber)) {
                  is_pinned = true;
                  break;
              }
          }
      }
      
      if (is_pinned) {
          robber->pin_tick_count++;
          if (robber->pin_tick_count >= 180) { // 3 continuous seconds
              robber->is_busted = true;
              robber->engine_torque = 0.0f; // Kill engine
              SpawnArrestEffect(robber->position);
          }
      } else {
          robber->pin_tick_count = 0;
      }
  }
  ```

---

## Mode 6: The Sweeper (Twisted System Jump Challenge)

- **Venue**: HomeBase Construction Pit (`HomeBase.trk`).
- **Roster & Spawns**: 16 players in `Fly.car` compacts parked in a circle around the quarry floor. Two `Bus.car` meshes welded end-to-end rotating from a central pivot.
- **Target Gameplay**: Throttle is disabled. Players press D-Pad Up / Cross to execute vertical jump impulses, clearing the spinning bus arm as it accelerates.
- **Engine Subsystems Scoped**:
  - Rigid hinge joint constraint.
  - Continuous angular velocity integration: $\omega(t) = \omega_0 + \alpha t$.
  - Vertical impulse injection: $\vec{J} = (0, 45000, 0)\text{ N}\cdot\text{s}$.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_TheSweeper_Tick() {
      // Rotate the double bus sweep arm
      g_sweep_angle += g_sweep_angular_velocity * (1.0f / 60.0f);
      g_sweep_angular_velocity += 0.0005f; // Accelerate each frame
      
      g_sweeper_bus->SetTransform(Matrix4::RotationY(g_sweep_angle));
      
      // Handle player jump inputs
      for (Car* compact : g_players) {
          compact->throttle = 0.0f;
          compact->steering = 0.0f;
          
          if (compact->input->WasJumpPressed() && compact->is_on_ground) {
              compact->rigid_body->ApplyImpulse(Vector3(0.0f, 45000.0f, 0.0f));
          }
      }
  }
  ```

---

## Mode 7: Ejector Seat Bowling (FlatOut Ballistic Stunts)

- **Venue**: Kenyon Mega Ramp & Straightaway.
- **Roster & Spawns**: Solo/multiplayer runs down the ramp in lightweight `Bullet.car`.
- **Target Gameplay**: Floor it down the massive ramp. Exactly at the jump apex, press Detonate to explode the undercarriage, converting the chassis into an aerodynamic free-flying missile aimed at giant scoring rings.
- **Engine Subsystems Scoped**:
  - Mesh-to-chassis constraint severance (`0x0006BC20`).
  - Kinetic momentum transfer: $\vec{V}' = 1.5 \cdot \vec{V}_{\text{car}}$.
  - Coordinate distance check on dirt landing floor.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_EjectorSeat_Detonate(Car* car) {
      // 1. Sever suspension and frame constraints
      car->SeverAllBoneConstraints();
      
      // 2. Transfer 150% momentum to body shell
      RigidBody* chassis_body = car->GetChassisRigidBody();
      chassis_body->SetLinearVelocity(car->velocity * 1.5f);
      chassis_body->SetAngularVelocity(Vector3(0.1f, 0.0f, 0.0f)); // Stable dart flight
      
      // 3. Register landing callback for concentric ring scoring
      RegisterLandingScorer(chassis_body, g_kenyon_target_center, g_scoring_rings);
  }
  ```

---

## Mode 8: The Meat Grinder (Deathloop Crossover)

- **Venue**: Baxter Speedway Oval.
- **Roster & Spawns**: 16 cars split into two equal 8-car heats.
- **Target Gameplay**: Half the pack races standard oval laps; the other half hits a steep crossover dirt ramp launching directly across the infield onto the opposite straightaway into oncoming traffic!
- **Engine Subsystems Scoped**:
  - External ramp mesh injection into `track.grf` and `track.bsc`.
  - Dual AI spline assignment (`oval.ild` vs `crossover.ild`).
- **Mathematical & Memory Hook**:
  ```cpp
  void Setup_MeatGrinder_Races() {
      // Load ramp geometry into active scene graph
      g_scene_graph->AttachModel("infield_crossover_ramp.mod", Vector3(15.0f, 0.0f, 0.0f));
      
      for (int i = 0; i < g_num_cars; i++) {
          if (i % 2 == 0) {
              // Standard Clockwise Oval Line
              g_cars[i]->ai_driver->SetCenterline("oval.ild");
          } else {
              // High-speed crossover jump line
              g_cars[i]->ai_driver->SetCenterline("crossover_jump.ild");
              g_cars[i]->ai_driver->target_speed = 38.0f; // Target launch speed 85 mph
          }
      }
  }
  ```

---

## Mode 9: Arena Combat (CTR Battle Mode with Crates & Mines)

- **Venue**: Welch Mud Arena.
- **Roster & Spawns**: 4 to 8 players in combat derbies.
- **Target Gameplay**: Ramming is supplemented by wooden weapon crates scattered in the mud. Smashing a crate yields a Mortar (chicken rocket) or a Mine (explosive barrel dropped from the rear bumper).
- **Engine Subsystems Scoped**:
  - Dynamic object pickup spawner.
  - Active weapon inventory slot.
  - Zero-velocity rear-bumper projectile dropper.
- **Mathematical & Memory Hook**:
  ```cpp
  void Deploy_RearBumper_Mine(Car* car) {
      // Compute coordinates 2.5m directly behind rear bumper
      Vector3 spawn_pos = car->position - (car->forward_vector * 2.5f);
      spawn_pos.y += 0.4f;
      
      // Spawn explosive barrel with zero linear velocity
      Entity* mine = SpawnDynamicObject("mine_barrel.mod", spawn_pos, Quaternion::Identity);
      mine->rigid_body->SetLinearVelocity(Vector3(0, 0, 0));
      mine->SetCollisionCallback([] (`Entity* mine, Car* toucher`, source checkout) {
          ExecuteExplosionShockwave(mine->position, 12.0f, 50000.0f);
          mine->Despawn();
      });
  }
  ```

---

## Mode 10: Keanu's Revenge (Trailer Hot Potato Bomb)

- **Venue**: Hastings Figure-8.
- **Roster & Spawns**: 16 players towing heavy `Trailer.car` campers.
- **Target Gameplay**: A 20-second timer ticks on the HUD. When it reaches zero, the player in Dead Last has their trailer violently detonate, eliminating them and leaving a burning metal hazard in the racing line.
- **Engine Subsystems Scoped**:
  - Trailer hitch physical constraint.
  - Real-time race position leaderboard array (`place[16]`).
  - Timed detonation impulse centered at hitch node.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_KeanusRevenge_TimerExpired() {
      // Find trailing car
      uint32_t last_place_car_idx = g_battle_master->place[g_num_active_cars - 1];
      Car* victim = g_cars[last_place_car_idx];
      
      // Execute explosion centered at trailer hitch node
      Vector3 hitch_pos = victim->position - (victim->forward_vector * 1.8f);
      ExecuteExplosionShockwave(hitch_pos, 15.0f, 65000.0f);
      
      // Sever trailer constraint and leave burning rigid body
      victim->SeverTrailerConstraint();
      victim->damage_ratio = 1.0f;
      g_num_active_cars--;
      
      // Reset 20-second timer for next elimination round
      g_bomb_timer_ticks = 20 * 60;
  }
  ```

---

## Mode 11: Pinball Derby (Kinetic Arena Walls)

- **Venue**: Mankato Demolition Arena.
- **Roster & Spawns**: 16 demolition cars.
- **Target Gameplay**: The arena concrete walls act like high-speed pinball bumpers. Slamming into a wall reflects your trajectory at 2.5× velocity back into the arena!
- **Engine Subsystems Scoped**:
  - Wall collision material restitution ($e = 2.5$).
  - Velocity vector reflection: $\vec{V}' = (\vec{V} - 2(\vec{V}\cdot\hat{n})\hat{n}) \times 2.5$.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_PinballWallCollision(Car* car, Vector3 wall_normal) {
      float v_dot_n = car->velocity.Dot(wall_normal);
      if (v_dot_n < 0.0f) { // Moving toward wall
          Vector3 reflected_vel = car->velocity - (wall_normal * (2.0f * v_dot_n));
          car->velocity = reflected_vel * 2.5f; // Supercharged bounce
          
          PlaySoundEffect("bumper_ping.sfx", car->position);
          SpawnSparksParticle(car->position, wall_normal);
      }
  }
  ```

---

## Mode 12: Shackled Sprint (Co-Op Physics Spring Chain)

- **Venue**: Dundas Figure-8.
- **Roster & Spawns**: 16 players organized into 8 two-car teams.
- **Target Gameplay**: You and your teammate are physically bound by an invisible 30-foot (9.14m) tension spring. If your teammate spins out, you get dragged to a halt!
- **Engine Subsystems Scoped**:
  - Multi-car spring constraint solver.
  - Spatial separation tension: $\vec{F} = k (d - 9.14)\hat{n}$.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_ShackledSprint_Tick() {
      const float REST_LENGTH = 9.14f; // 30 feet
      const float SPRING_K   = 15000.0f;
      
      for (auto& pair : g_shackled_teams) {
          Car* carA = pair.first;
          Car* carB = pair.second;
          
          Vector3 delta = carB->position - carA->position;
          float dist = delta.Length();
          if (dist > REST_LENGTH) {
              Vector3 dir = delta / dist;
              float stretch = dist - REST_LENGTH;
              Vector3 force = dir * (SPRING_K * stretch);
              
              carA->rigid_body->ApplyCentralForce(force);
              carB->rigid_body->ApplyCentralForce(-force);
          }
      }
  }
  ```

---

## Mode 13: Red Light, Green Light

- **Venue**: Kenyon Mega Straightaway.
- **Roster & Spawns**: 32 cars lined up shoulder-to-shoulder.
- **Target Gameplay**: Stop on a dime, or explode! On Green: floor it. On Red: come to a complete halt within 1.5 seconds. Any car still moving is detonated into the sky!
- **Engine Subsystems Scoped**:
  - Global traffic light state machine.
  - Velocity vector magnitude sensor ($\|\vec{V}\| &gt; 0.22\text{ m/s} = 0.5\text{ mph}$).
  - Chassis detonation trigger.
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_RedLightGreenLight_RedCheck() {
      for (Car* car : g_all_cars) {
          if (!car->is_eliminated && car->velocity.Length() > 0.22f) { // Moving > 0.5 MPH
              ExecuteExplosionShockwave(car->position, 8.0f, 60000.0f);
              car->damage_ratio = 1.0f;
              car->is_eliminated = true;
          }
      }
  }
  ```

---

## Mode 14: Quarry Bowling (Gravity Strike Challenge)

- **Venue**: HomeBase Construction Pit (`HomeBase.trk`).
- **Roster & Spawns**: 10 AI `Taxi.car` parked in a 10-pin triangle at the bottom of the pit; 1 player in an `Ambulance.car` at the top rim.
- **Target Gameplay**: Launch down the cliff, hit a natural bump, and smash into the Taxis. Points are scored for every Taxi scattered outside a painted ring!
- **Engine Subsystems Scoped**:
  - Inert rigid body initializer (`ParkDriver` at `0x001FC828`).
  - Spatial radius score evaluation ($R = 15.0\text{ meters}$).
- **Mathematical & Memory Hook**:
  ```cpp
  void Evaluate_QuarryBowling_Score() {
      int knocked_out = 0;
      for (Car* taxi : g_bowling_pins) {
          float dist = taxi->position.DistanceTo(g_bowling_ring_center);
          if (dist > 15.0f) {
              knocked_out++;
          }
      }
      g_player_score += (knocked_out * 100);
      if (knocked_out == 10) g_player_score += 500; // Strike Bonus!
  }
  ```

---

## Mode 15: Relic Hunt (Demolition Crystal Scramble)

- **Venue**: Baxter Demolition Arena.
- **Roster & Spawns**: 4 human players scrambling for 30 glowing tokens; 8 AI `Bus.car` opponents relentlessly patrolling the arena.
- **Target Gameplay**: Collect the most relics before the 2-minute timer ends while evading 8 AI buses actively hunting player coordinates!
- **Engine Subsystems Scoped**:
  - Static spatial token triggers.
  - Relic count inventory.
  - `WrangleDriver` AI hunter bus controllers (`0x001FE3F0`).
- **Mathematical & Memory Hook**:
  ```cpp
  void Hook_RelicTriggerOverlap(Entity* token, Car* player) {
      if (!player->is_ai) {
          player->relic_count++;
          token->Despawn();
          PlaySoundEffect("relic_pickup.sfx", player->position);
      }
  }
  ```
