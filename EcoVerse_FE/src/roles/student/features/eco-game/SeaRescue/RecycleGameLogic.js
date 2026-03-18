import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/* ===================== CONSTANTS ===================== */
export const PLAYER_CAPACITY = 5;
export const PLAYER_MAX_HP = 10;
export const PLAYER_MAX_SPEED = 0.2;
export const PLAYER_ACCELERATION = 0.008;
export const PLAYER_FRICTION = 0.92;
export const PLAYER_TURN_SPEED = 0.045;
export const PLAYER_TURN_FRICTION = 0.77;
export const PLAYER_COLLISION_RADIUS = 1.5;
export const OBSTACLE_COLLISION_RADIUS = 1.0;

export const SPEED_ZONE_COUNT = 3;
export const SLOW_ZONE_COUNT = 3;
export const ZONE_RADIUS = 3;

export const TOTAL_TRASH = 12;
export const OBSTACLE_COUNT = 6;
export const OBSTACLE_DAMAGE_COOLDOWN = 1000;

export const AUTO_PICKUP_DISTANCE = 1.2;
export const STORAGE_ZONE_RADIUS = 4;

export const GAME_TIME = 60;
export const REQUIRED_PERCENTAGE = 80;

/* ===================== UTILS ===================== */
export const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

const loadModel = (url) =>
  new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });

const makeMesh = (geo, color) =>
  new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));

/* ===================== TRASH (Simple Geometry — no model) ===================== */
const TRASH_COLORS = [0x22c55e, 0xeab308, 0x3b82f6, 0xef4444, 0xa855f7];

function createTrashMesh() {
  const color = TRASH_COLORS[Math.floor(Math.random() * TRASH_COLORS.length)];
  const group = new THREE.Group();

  // Bag body
  const body = makeMesh(new THREE.SphereGeometry(0.35, 8, 8), color);
  body.scale.set(1, 1.2, 1);
  body.position.y = 0.35;
  body.castShadow = true;

  // Bag tie (top knot)
  const knot = makeMesh(new THREE.SphereGeometry(0.1, 6, 6), 0x1a1a1a);
  knot.position.y = 0.8;

  group.add(body, knot);
  group.userData.pickupRadius = 0.5;
  return group;
}

/* ===================== INIT SCENE ===================== */
export function initScene(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7dd3fc);

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  return { scene, camera, renderer };
}

/* ===================== INIT WORLD ===================== */
export function initWorld(scene) {
  // Set sea background
  scene.background = new THREE.Color(0x7dd3fc);

  // Ocean ground
  const gltfLoaderGround = new GLTFLoader();
  const oceanState = {
    oceanModel: null,
    oceanMixer: null,
    fallbackPlane: null,
  };

  gltfLoaderGround.load(
    "/assets/ocean__water_perfect_loop.glb",
    (gltf) => {
      const oceanModel = gltf.scene;
      oceanModel.scale.set(0.5, 0.5, 0.5);
      oceanModel.position.set(0, -0.3, 0);
      oceanModel.traverse((child) => {
        if (child.isMesh) child.receiveShadow = true;
      });
      scene.add(oceanModel);
      oceanState.oceanModel = oceanModel;

      if (gltf.animations?.length > 0) {
        const mixer = new THREE.AnimationMixer(oceanModel);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        oceanState.oceanMixer = mixer;
      }
    },
    undefined,
    () => {
      // Fallback plain
      const fallback = makeMesh(new THREE.PlaneGeometry(100, 100), 0x0ea5e9);
      fallback.rotation.x = -Math.PI / 2;
      scene.add(fallback);
      oceanState.fallbackPlane = fallback; // track for disposal
    },
  );

  // Underwater depth plane — tracked for disposal
  const underwaterPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({
      color: 0x0c4a6e,
      transparent: true,
      opacity: 0.8,
    }),
  );
  underwaterPlane.rotation.x = -Math.PI / 2;
  underwaterPlane.position.y = -2;
  scene.add(underwaterPlane);
  oceanState.underwaterPlane = underwaterPlane; // track for disposal

  return oceanState;
}

/* ===================== INIT STORAGE (LIGHTHOUSE) ===================== */
export function initStorage(scene) {
  const storage = new THREE.Group();
  storage.position.set(0, 0, -15);
  scene.add(storage);

  loadModel("/assets/the_lighthouse.glb")
    .then((model) => {
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scale = 8 / size.y;
      model.scale.setScalar(scale);
      model.position.y -= box.min.y * scale;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      storage.add(model);
    })
    .catch(() => {
      const fallback = makeMesh(
        new THREE.CylinderGeometry(2, 2, 1, 32),
        0x22c55e,
      );
      fallback.position.y = 0.5;
      storage.add(fallback);
    });

  return storage;
}

/* ===================== INIT PLAYER (BOAT) ===================== */
export function initPlayer(scene) {
  const player = new THREE.Group();
  scene.add(player);

  const playerState = { mixer: null, actions: {}, activeAction: null };

  loadModel("/assets/boat.glb").then((model) => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 4 / size.y;
    model.scale.setScalar(scale);
    model.position.y -= box.min.y * scale;
    player.add(model);

    playerState.mixer = new THREE.AnimationMixer(model);
    model.animations.forEach((clip) => {
      playerState.actions[clip.name.toLowerCase()] =
        playerState.mixer.clipAction(clip);
    });
    playerState.activeAction =
      playerState.actions.idle ||
      playerState.actions.walk ||
      playerState.actions.run;
    playerState.activeAction?.play();
  });

  return { player, playerState };
}

/* ===================== INIT TRASH (Simple geometry — no model) ===================== */
export function initTrash(scene) {
  const trash = [];

  for (let i = 0; i < TOTAL_TRASH; i++) {
    const t = createTrashMesh();
    t.position.set((Math.random() - 0.5) * 30, 0.3, (Math.random() - 0.5) * 30);
    scene.add(t);
    trash.push(t);
  }

  return trash;
}

/* ===================== INIT OBSTACLES (ROCKS) ===================== */
export function initObstacles(scene) {
  const obstacles = [];
  const minDistFromPlayer = 5;
  const minDistBetweenObstacles = 4;

  const spawnObstacle = (mesh) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 50) {
      const x = (Math.random() - 0.5) * 25;
      const z = (Math.random() - 0.5) * 25;
      const distFromPlayer = Math.sqrt(x * x + z * z);
      const distFromStorage = Math.sqrt(x * x + (z + 15) * (z + 15));
      if (distFromPlayer > minDistFromPlayer && distFromStorage > 6) {
        let tooClose = false;
        for (const o of obstacles) {
          const dx = x - o.position.x;
          const dz = z - o.position.z;
          if (Math.sqrt(dx * dx + dz * dz) < minDistBetweenObstacles) {
            tooClose = true;
            break;
          }
        }
        if (!tooClose) {
          mesh.position.set(x, 0, z);
          placed = true;
        }
      }
      attempts++;
    }
    if (!placed)
      mesh.position.set(
        (Math.random() - 0.5) * 25,
        0,
        (Math.random() - 0.5) * 25,
      );
    obstacles.push(mesh);
    scene.add(mesh);
  };

  loadModel("/assets/rock.glb")
    .then((rockModel) => {
      for (let i = 0; i < OBSTACLE_COUNT; i++) {
        const rock = rockModel.clone(true);
        const scale = 0.08 + Math.random() * 0.4;
        rock.scale.setScalar(scale);
        rock.rotation.y = Math.random() * Math.PI * 2;
        rock.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        spawnObstacle(rock);
      }
    })
    .catch(() => {
      for (let i = 0; i < OBSTACLE_COUNT; i++) {
        const o = makeMesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), 0x991b1b);
        o.position.y = 0.75;
        spawnObstacle(o);
      }
    });

  return obstacles;
}

/* ===================== INIT ZONES ===================== */
export function initZones(scene, obstacles) {
  const speedZones = [];
  const slowZones = [];
  const allZonePositions = [];
  const MIN_ZONE_DISTANCE = ZONE_RADIUS * 2.5;

  const findValidZonePosition = () => {
    let attempts = 0;
    while (attempts < 100) {
      const x = (Math.random() - 0.5) * 35;
      const z = (Math.random() - 0.5) * 35;
      if (Math.sqrt(x * x + z * z) < 8) {
        attempts++;
        continue;
      }
      if (Math.sqrt(x * x + (z + 15) * (z + 15)) < 8) {
        attempts++;
        continue;
      }
      let tooClose = false;
      for (const o of obstacles) {
        const dx = x - o.position.x;
        const dz = z - o.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < ZONE_RADIUS + 2) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) {
        attempts++;
        continue;
      }
      for (const p of allZonePositions) {
        const dx = x - p.x;
        const dz = z - p.z;
        if (Math.sqrt(dx * dx + dz * dz) < MIN_ZONE_DISTANCE) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) {
        attempts++;
        continue;
      }
      return { x, z };
    }
    return null;
  };

  // Speed zones (cyan cylinders)
  for (let i = 0; i < SPEED_ZONE_COUNT; i++) {
    const pos = findValidZonePosition();
    if (!pos) continue;
    allZonePositions.push(pos);
    const { x, z } = pos;

    const zone = new THREE.Mesh(
      new THREE.CylinderGeometry(ZONE_RADIUS, ZONE_RADIUS, 0.1, 32),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.4,
      }),
    );
    zone.position.set(x, 0.05, z);
    zone.userData.type = "speed";
    zone.userData.multiplier = 1.8;
    speedZones.push(zone);
    scene.add(zone);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(ZONE_RADIUS - 0.1, ZONE_RADIUS, 32),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.06, z);
    scene.add(ring);

    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4 }),
    );
    arrow.position.set(x, 0.5, z);
    arrow.rotation.z = Math.PI;
    zone.userData.arrow = arrow;
    scene.add(arrow);
  }

  // Slow zones (lightning model)
  loadModel("/models/lightning.glb")
    .then((lightningPrototype) => {
      lightningPrototype.traverse((c) => {
        if (c.isMesh) c.castShadow = true;
      });

      for (let i = 0; i < SLOW_ZONE_COUNT; i++) {
        const pos = findValidZonePosition();
        if (!pos) continue;
        allZonePositions.push(pos);
        const { x, z } = pos;

        const zone = new THREE.Object3D();
        zone.position.set(x, 0, z);
        zone.userData.type = "slow";
        zone.userData.multiplier = 0.4;

        const lightning = lightningPrototype.clone(true);
        lightning.scale.set(0.9, 0.9, 0.9);
        lightning.position.y = 0.2;
        lightning.rotation.y = Math.random() * Math.PI * 2;
        zone.add(lightning);
        zone.userData.lightning = lightning;

        slowZones.push(zone);
        scene.add(zone);
      }
    })
    .catch((err) => console.error("Failed to load lightning.glb", err));

  return { speedZones, slowZones };
}

/* ===================== GAME LOOP TICK ===================== */
export function gameTick({
  state,
  scene,
  camera,
  renderer,
  player,
  playerState,
  storage,
  setInventoryCount,
  setRecycledCount,
  setHp,
  setCurrentZone,
  setInventoryFull,
  setHudPulse,
  setDamageFlash,
  setScreenShake,
  endGame,
  clock,
}) {
  if (state.stopped) return;

  const delta = clock.getDelta();

  // Ocean animation
  if (state.oceanMixer) state.oceanMixer.update(delta);

  const isMobileMode = isMobileDevice();
  let turnInput = 0;
  let move = 0;

  // Zone check
  let inZone = null;
  state.speedMultiplier = 1;

  for (const zone of state.allZones) {
    const dx = player.position.x - zone.position.x;
    const dz = player.position.z - zone.position.z;
    if (Math.sqrt(dx * dx + dz * dz) < ZONE_RADIUS) {
      inZone = zone.userData.type;
      state.speedMultiplier = zone.userData.multiplier;
      if (zone.userData.arrow) {
        zone.userData.arrow.position.y =
          0.5 + Math.sin(Date.now() * 0.005) * 0.2;
        zone.userData.arrow.rotation.y += 0.05;
      }
      break;
    }
  }

  setCurrentZone(inZone);

  // Animate lightning zones
  for (const zone of state.allZones) {
    if (zone.userData.lightning) {
      zone.userData.lightning.rotation.y += 0.04;
      const flicker = 1 + Math.sin(Date.now() * 0.02) * 0.08;
      zone.userData.lightning.scale.set(
        0.6 * flicker,
        0.6 * flicker,
        0.6 * flicker,
      );
    }
  }

  // Input
  if (isMobileMode) {
    if (Math.abs(state.joystick.x) > 0.1) turnInput = -state.joystick.x;
    if (Math.abs(state.joystick.y) > 0.1) move = state.joystick.y;
  } else {
    turnInput = (state.keys["a"] ? 1 : 0) - (state.keys["d"] ? 1 : 0);
    move = (state.keys["s"] ? 1 : 0) - (state.keys["w"] ? 1 : 0);
  }

  // Turn with inertia
  state.angularVelocity += turnInput * PLAYER_TURN_SPEED * 0.3;
  state.angularVelocity *= PLAYER_TURN_FRICTION;
  if (Math.abs(state.angularVelocity) < 0.001) state.angularVelocity = 0;
  player.rotation.y += state.angularVelocity;

  const forward = new THREE.Vector3(
    Math.sin(player.rotation.y),
    0,
    Math.cos(player.rotation.y),
  );

  // Movement
  const effectiveAccel = PLAYER_ACCELERATION * state.speedMultiplier;
  if (Math.abs(move) > 0.01) {
    state.velocity.add(forward.clone().multiplyScalar(move * effectiveAccel));
  }

  const effectiveFriction =
    inZone === "slow" ? PLAYER_FRICTION * 0.95 : PLAYER_FRICTION;
  state.velocity.multiplyScalar(effectiveFriction);

  const effectiveMaxSpeed = PLAYER_MAX_SPEED * state.speedMultiplier;
  if (state.velocity.length() > effectiveMaxSpeed)
    state.velocity.setLength(effectiveMaxSpeed);
  if (state.velocity.length() < 0.001) state.velocity.set(0, 0, 0);

  // Animation
  const isMoving = state.velocity.length() > 0.02;
  const nextAction = isMoving ? "run" : "idle";
  const next = playerState.actions[nextAction];
  if (next && next !== playerState.activeAction) {
    playerState.activeAction?.fadeOut(0.25);
    next.reset().fadeIn(0.25).play();
    playerState.activeAction = next;
  }

  const nextPosition = player.position.clone().add(state.velocity);

  // Collision
  const combinedRadius = PLAYER_COLLISION_RADIUS + OBSTACLE_COLLISION_RADIUS;
  for (const o of state.obstacles) {
    const diff = nextPosition.clone().sub(o.position);
    diff.y = 0;
    const distance = diff.length();

    if (distance < combinedRadius) {
      const pushDir = diff.clone().normalize();
      const penetration = combinedRadius - distance;
      nextPosition.add(pushDir.clone().multiplyScalar(penetration + 0.05));

      const velocityDot = state.velocity.dot(pushDir);
      if (velocityDot < 0)
        state.velocity.sub(pushDir.clone().multiplyScalar(velocityDot * 1.5));
      state.velocity.add(pushDir.clone().multiplyScalar(0.05));

      const now = Date.now();

      // Drop items on collision
      if (state.inventory.length > 0 && now - state.lastDropTime > 500) {
        state.lastDropTime = now;
        const droppedItems = [...state.inventory];
        state.inventory = [];
        setInventoryCount(0);

        droppedItems.forEach((item) => {
          scene.attach(item);
          item.scale.set(1, 1, 1); // reset to group scale (no model scaling needed)
          item.rotation.set(0, 0, 0);
          item.updateMatrix();
          item.updateMatrixWorld(true);

          const scatterAngle = Math.random() * Math.PI * 2;
          const scatterSpeed = 0.15 + Math.random() * 0.1;
          state.scatteredItems.push({
            mesh: item,
            velocity: new THREE.Vector3(
              Math.cos(scatterAngle) * scatterSpeed,
              0.08 + Math.random() * 0.05,
              Math.sin(scatterAngle) * scatterSpeed,
            ),
            startTime: now,
            bounces: 0,
          });
          state.trash.push(item);
        });
      }

      // Damage
      if (now - state.lastDamageTime > OBSTACLE_DAMAGE_COOLDOWN) {
        state.lastDamageTime = now;
        state.hitTime = now;

        setDamageFlash(true);
        setTimeout(() => setDamageFlash(false), 200);

        const shakeInterval = setInterval(() => {
          setScreenShake({
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8,
          });
        }, 30);
        setTimeout(() => {
          clearInterval(shakeInterval);
          setScreenShake({ x: 0, y: 0 });
        }, 300);

        setHudPulse(true);
        setTimeout(() => setHudPulse(false), 150);

        setHp((hp) => {
          if (hp <= 1) {
            endGame("death");
            return 0;
          }
          return hp - 1;
        });
      }
    }
  }

  player.position.copy(nextPosition);
  player.position.y = 0.3;

  // Hit flash
  const isHit = Date.now() - state.hitTime < 200;
  player.traverse((o) => {
    if (o.isMesh && o.material) {
      if (isHit) {
        o.material.transparent = true;
        o.material.opacity = 0.5;
        if (o.material.color) {
          o.material.emissive = new THREE.Color(0xff0000);
          o.material.emissiveIntensity = 0.5;
        }
      } else {
        o.material.transparent = false;
        o.material.opacity = 1;
        if (o.material.emissive) o.material.emissiveIntensity = 0;
      }
    }
  });

  // Auto pickup
  state.trash = state.trash.filter((t) => {
    const wp = new THREE.Vector3();
    t.getWorldPosition(wp);
    const dx = wp.x - player.position.x;
    const dz = wp.z - player.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const trashRadius = Math.max(t.userData.pickupRadius ?? 0.3, 0.4);
    const pickupDist = PLAYER_COLLISION_RADIUS + trashRadius;

    if (dist < pickupDist) {
      if (state.inventory.length >= PLAYER_CAPACITY) {
        const now = Date.now();
        if (now - state.lastInventoryFullWarning > 500) {
          state.lastInventoryFullWarning = now;
          setInventoryFull(true);
          setTimeout(() => setInventoryFull(false), 800);
        }
        return true;
      }
      state.inventory.push(t);
      scene.remove(t);
      player.add(t);
      t.position.set(0, 0.8 + state.inventory.length * 0.25, -0.4);
      t.scale.set(1, 1, 1);
      setInventoryCount(state.inventory.length);
      setInventoryFull(false);
      setHudPulse(true);
      setTimeout(() => setHudPulse(false), 150);
      return false;
    }
    return true;
  });

  // Storage deposit
  if (
    player.position.distanceTo(storage.position) < STORAGE_ZONE_RADIUS &&
    state.inventory.length
  ) {
    const count = state.inventory.length;
    state.inventory.forEach((t, idx) => {
      player.remove(t);
      scene.add(t);
      const worldPos = new THREE.Vector3();
      player.getWorldPosition(worldPos);
      t.position.copy(worldPos);
      t.position.y = 2 + idx * 0.3;
      state.fallingItems.push({
        mesh: t,
        startY: t.position.y,
        targetY: storage.position.y + 0.5,
        startTime: Date.now(),
        duration: 500 + idx * 100,
      });
    });
    state.inventory = [];
    setInventoryCount(0);
    state.recycledInStorage += count;
    setRecycledCount(state.recycledInStorage);
    if (state.recycledInStorage >= TOTAL_TRASH)
      setTimeout(() => endGame("win"), 800);
    setHudPulse(true);
    setTimeout(() => setHudPulse(false), 200);
  }

  // Falling items
  const now = Date.now();
  state.fallingItems = state.fallingItems.filter((item) => {
    const elapsed = now - item.startTime;
    const progress = Math.min(elapsed / item.duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    item.mesh.position.y = THREE.MathUtils.lerp(
      item.startY,
      item.targetY,
      ease,
    );
    item.mesh.rotation.y += 0.1;
    if (progress >= 1) {
      scene.remove(item.mesh);
      return false;
    }
    return true;
  });

  // Scattered items
  const GRAVITY = 0.008;
  const GROUND_Y = 0.3;
  state.scatteredItems = state.scatteredItems.filter((item) => {
    const elapsed = now - item.startTime;
    item.velocity.y -= GRAVITY;
    item.mesh.position.add(item.velocity);
    item.mesh.rotation.x += 0.15;
    item.mesh.rotation.z += 0.1;
    if (item.mesh.position.y < GROUND_Y) {
      item.mesh.position.y = GROUND_Y;
      item.velocity.y *= -0.4;
      item.velocity.x *= 0.7;
      item.velocity.z *= 0.7;
      item.bounces++;
    }
    if (elapsed > 2000 || item.bounces > 3) {
      item.mesh.position.y = GROUND_Y;
      item.mesh.rotation.set(0, 0, 0);
      return false;
    }
    return true;
  });

  // Camera
  const cameraOffset = new THREE.Vector3(0, 4, 7).applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    player.rotation.y,
  );
  camera.position.lerp(player.position.clone().add(cameraOffset), 0.08);
  camera.lookAt(player.position.x, player.position.y + 1.6, player.position.z);

  playerState.mixer?.update(delta);
  renderer?.render(scene, camera);
}
