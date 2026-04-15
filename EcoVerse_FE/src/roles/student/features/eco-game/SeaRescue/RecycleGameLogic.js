import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { SPAWNABLE_TRASH } from "../EcoGameStateManager";

/* ===================== CONSTANTS ===================== */
export const TOTAL_TRASH = 12;

export const PLAYER_CAPACITY = 5;
export const PLAYER_MAX_HP = 5;
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

export const OBSTACLE_COUNT = 6;
export const OBSTACLE_DAMAGE_COOLDOWN = 1000;

export const AUTO_PICKUP_DISTANCE = 1.2;
export const STORAGE_ZONE_RADIUS = 4;

export const GAME_TIME = 60;
export const REQUIRED_PERCENTAGE = 80;

export const WORLD_SAFE_RADIUS = 55;

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
  // scene.background = new THREE.Color(0x7dd3fc);

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x000000, 0); // Transparent for HUD usage
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  return { scene, camera, renderer };
}

function createBuoyMesh(isRed) {
  const group = new THREE.Group();
  const color = isRed ? 0xef4444 : 0xffffff;
  const sphere = makeMesh(new THREE.SphereGeometry(0.5, 12, 12), color);
  sphere.castShadow = true;
  group.add(sphere);
  const stick = makeMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8), 0x333333);
  stick.position.y = 0.6;
  group.add(stick);
  const light = makeMesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    isRed ? 0xff0000 : 0xffff00,
  );
  light.position.y = 1.0;
  group.add(light);
  return group;
}

/* ===================== INIT WORLD ===================== */
export function initWorld(scene, state) {
  // Set sea background (Blue fallback while 3D Skybox loads)
  scene.background = new THREE.Color(0x7dd3fc);

  // 3D Skybox Loading
  const skyboxLoader = new GLTFLoader();
  skyboxLoader.load(
    "/assets/skybox.glb",
    (gltf) => {
      const model = gltf.scene;
      const skyboxContainer = new THREE.Group();

      // 1. Calculate the actual bounding box of the model to determine its true size/center
      const bbox = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = bbox.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // 2. Normalize and scale perfectly to encapsulate the world
      // We want the skybox to be large (3500 units) but safely within the 5000 camera far plane
      const targetSize = 3500;
      const scaleFactor = maxDim > 0 ? targetSize / maxDim : 1;
      model.scale.setScalar(scaleFactor);

      // 3. Center the model's geometry relative to the skyboxContainer
      // This ensures that even if the GLB's origin is offset, the skybox centers on 0,0,0
      model.position.set(
        -center.x * scaleFactor,
        -center.y * scaleFactor,
        -center.z * scaleFactor,
      );

      console.log(`[Skybox Debug] Name: ${model.name || "skybox"}, size:`, size, "scale:", scaleFactor);

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          child.frustumCulled = false;

          if (child.material) {
            const oldMat = child.material;
            // Force basic material (unlit) and render inside (BackSide)
            child.material = new THREE.MeshBasicMaterial({
              map: oldMat.map,
              color: oldMat.color,
              side: THREE.BackSide,
              fog: false,
              depthWrite: false, // Prevent the sky from blocking other transparency
            });
            oldMat.dispose();
          }
        }
      });

      skyboxContainer.add(model);
      scene.add(skyboxContainer);
      state.skybox = skyboxContainer;

      console.log("[Skybox Debug] Added to scene at current camera far range.");
    },
    undefined,
    (err) => console.warn("Failed to load /assets/skybox.glb", err),
  );

  // Ocean ground
  const gltfLoaderGround = new GLTFLoader();
  gltfLoaderGround.load(
    "/assets/ocean__water_perfect_loop.glb",
    (gltf) => {
      const oceanModel = gltf.scene;
      oceanModel.scale.set(0.8, 0.8, 0.8);
      oceanModel.position.set(0, -0.3, 0);
      oceanModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
        }
      });
      scene.add(oceanModel);
      state.oceanModel = oceanModel;

      if (gltf.animations?.length > 0) {
        const mixer = new THREE.AnimationMixer(oceanModel);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        state.oceanMixer = mixer;
      }
    },
    undefined,
    () => {
      // Fallback
      const fallback = makeMesh(
        new THREE.CircleGeometry(WORLD_SAFE_RADIUS, 64),
        0x0ea5e9,
      );
      fallback.rotation.x = -Math.PI / 2;
      scene.add(fallback);
      state.fallbackPlane = fallback;
    },
  );


  // Buoy Perimeter (Physical indicator)
  const buoyCount = 36;
  const buoys = [];
  for (let i = 0; i < buoyCount; i++) {
    const angle = (i / buoyCount) * Math.PI * 2;
    const isRed = i % 2 === 0;
    const buoy = createBuoyMesh(isRed);
    buoy.position.set(
      Math.cos(angle) * WORLD_SAFE_RADIUS,
      0.1,
      Math.sin(angle) * WORLD_SAFE_RADIUS,
    );
    buoy.lookAt(0, 0, 0);
    scene.add(buoy);
    buoys.push(buoy);
  }

  // Track for disposal
  state.buoys = buoys;
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
          child.castShadow = true;
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

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

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
/* ===================== PROCEDURAL MESH HELPERS ===================== */
function createBottleMesh(color = 0xffffff) {
  const group = new THREE.Group();
  const bodyGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.6, 8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.8,
    roughness: 0.3,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const capGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.1, 8);
  const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.35;
  group.add(cap);
  return group;
}

function createCanMesh(color = 0x9e9e9e) {
  const geo = new THREE.CylinderGeometry(0.16, 0.16, 0.45, 12);
  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  return mesh;
}

function createBoxTrashMesh(color = 0xffffff) {
  const geo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  return mesh;
}

/* ===================== INIT TRASH ===================== */
export function initTrash(
  scene,
  wasteItems = [],
  totalTrashCount = TOTAL_TRASH,
) {
  const trash = [];
  const count = totalTrashCount > 0 ? totalTrashCount : TOTAL_TRASH;

  // Debug rác từ API
  console.log("[SeaRescue] initTrash wasteItems:", wasteItems);
  if (wasteItems.length > 0) {
    console.log("[SeaRescue] First item Sample:", {
      id: wasteItems[0].wasteItemId || wasteItems[0].id,
      hasModel: !!wasteItems[0].preloadedModel,
      modelType: typeof wasteItems[0].preloadedModel,
      url: wasteItems[0].imageUrl || wasteItems[0].imagePresignedUrl,
    });
  }

  let sourceItems = wasteItems;
  if (!sourceItems || sourceItems.length === 0) {
    console.warn(
      "[SeaRescue] No wasteItems from API. Falling back to SPAWNABLE_TRASH.",
    );
    sourceItems = SPAWNABLE_TRASH;
  }

  const loader = new GLTFLoader();

  const catColors = {
    RECYCLABLE: 0x2196f3,
    ORGANIC: 0x4caf50,
    HAZARDOUS: 0xf44336,
    GENERAL: 0xeeeeee,
    recycle: 0x2196f3,
    organic: 0x4caf50,
    inorganic: 0xf44336,
  };

  for (let i = 0; i < count; i++) {
    const apiItem = sourceItems[i % sourceItems.length];

    const finalizeMesh = (mesh) => {
      if (!mesh) return;

      // Container to keep model scale separate from aura scale
      const trashGroup = new THREE.Group();
      trashGroup.position.set(
        (Math.random() - 0.5) * 45,
        0.3,
        (Math.random() - 0.5) * 45,
      );

      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      // Normalize model ONLY
      if (maxDim > 0) mesh.scale.multiplyScalar(1.5 / maxDim);

      mesh.updateMatrixWorld(true);

      // Re-calculate box after scaling for accurate alignment
      const finalBox = new THREE.Box3().setFromObject(mesh);
      const center = finalBox.getCenter(new THREE.Vector3());

      // Center the whole mesh on X and Z, and lift it so bottom is at y=0 relative to trashGroup
      mesh.position.x = -center.x;
      mesh.position.z = -center.z;
      mesh.position.y = -finalBox.min.y;

      mesh.traverse((child) => {
        if (child.isMesh) {
          // Clone material to avoid shared state visibility issues
          if (child.material) {
            child.material = child.material.clone();

            // Store original state for hit-flash restoration
            child.userData.originalTransparent = child.material.transparent;
            child.userData.originalOpacity = child.material.opacity;

            if (child.material.emissive) {
              child.material.emissive.setHex(0x444444);
              child.material.emissiveIntensity = 0.4;
            }
          }

          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      trashGroup.add(mesh);

      trashGroup.userData.pickupRadius = 1.0;
      trashGroup.userData.wasteItemId = apiItem.wasteItemId || apiItem.id;
      trashGroup.userData.wasteCategory =
        apiItem.wasteCategory || apiItem.bin?.toUpperCase() || "GENERAL";
      trashGroup.userData.itemName = apiItem.itemName || apiItem.name;
      trashGroup.userData.trashType = {
        id: trashGroup.userData.wasteItemId,
        name: trashGroup.userData.itemName,
        bin: trashGroup.userData.wasteCategory.toLowerCase(),
        imageUrl: apiItem.imageUrl || apiItem.imagePresignedUrl,
        preloadedModel: apiItem.preloadedModel,
        modelUrl:
          (typeof apiItem.preloadedModel === "string" &&
            apiItem.preloadedModel) ||
          apiItem.imagePresignedUrl ||
          apiItem.imageUrl,
        funFact: apiItem.funFact, // Captured for result display
      };

      const auraColor =
        catColors[trashGroup.userData.wasteCategory] || 0xffffff;
      // Fixed size aura (not affected by mesh scale)
      const auraGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16, 1, true);
      const auraMat = new THREE.MeshStandardMaterial({
        color: auraColor,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        emissive: auraColor,
        emissiveIntensity: 0.5,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.position.y = 0.3;
      trashGroup.add(aura);
      trashGroup.userData.aura = aura;

      scene.add(trashGroup);
      trash.push(trashGroup);
    };

    const spawnFallback = () => {
      let m;
      const itemId = apiItem.wasteItemId || apiItem.id;
      switch (itemId) {
        case "plastic_bottle":
          m = createBottleMesh(apiItem.color || 0xffffff);
          break;
        case "can":
          m = createCanMesh(apiItem.color || 0x9e9e9e);
          break;
        default:
          m = createBoxTrashMesh(apiItem.color || 0x22c55e);
          break;
      }
      finalizeMesh(m);
    };

    // Ưu tiên 1: Model đã được clone từ GLTF preloaded (Stage 1 đã load)
    if (apiItem.preloadedModel && typeof apiItem.preloadedModel !== "string") {
      finalizeMesh(apiItem.preloadedModel.clone(true));
    }
    // Ưu tiên 2: URL từ presignedUrl hoặc preloadedModel (nếu là string)
    else {
      const modelUrl =
        (typeof apiItem.preloadedModel === "string" &&
          apiItem.preloadedModel) ||
        apiItem.imagePresignedUrl ||
        apiItem.imageUrl;

      if (modelUrl) {
        loader.load(
          modelUrl,
          (gltf) => finalizeMesh(gltf.scene.clone(true)),
          undefined,
          (err) => {
            console.error(
              `[SeaRescue] Failed to load trash model: ${modelUrl}`,
              err,
            );
            spawnFallback();
          },
        );
      } else {
        spawnFallback();
      }
    }
  }

  return trash;
}

/* ===================== INIT OBSTACLES (ROCKS) ===================== */
export function initObstacles(scene) {
  const obstacles = [];
  const minDistFromPlayer = 8;
  const minDistBetweenObstacles = 8;

  const spawnObstacle = (mesh) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const x = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 45;
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
        (Math.random() - 0.5) * 45,
        0,
        (Math.random() - 0.5) * 45,
      );
    obstacles.push(mesh);
    scene.add(mesh);
  };

  loadModel("/assets/rock.glb")
    .then((rockModel) => {
      for (let i = 0; i < OBSTACLE_COUNT; i++) {
        const rock = rockModel.clone(true);
        const scale = 0.1 + Math.random() * 0.4;
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
    ring.position.set(0, 0.01, 0); // Relative to zone
    zone.add(ring);

    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4 }),
    );
    arrow.position.set(0, 0.45, 0); // Relative to zone
    arrow.rotation.z = Math.PI;
    zone.userData.arrow = arrow;
    zone.add(arrow);
  }

  // Slow zones removed per user request
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
  onPickup,
  onDamage,
  onItemDeposited,
  clock,
}) {
  if (state.stopped) return;

  if (state.skybox) {
    state.skybox.position.copy(player.position);
  }

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

  // Animate trash items (Aura pulse and rotation)
  state.trash.forEach((t) => {
    if (!t) return;
    // Rotation of the model inside the group
    const model = t.children.find((c) => c.type === "Group" || c.isMesh);
    if (model) model.rotation.y += delta * 1.5;

    // Aura pulse
    if (t.userData.aura && t.userData.aura.material) {
      const pulse = Math.sin(Date.now() * 0.003) * 0.15 + 0.35;
      t.userData.aura.material.opacity = pulse;
    }
  });

  // Animate lightning zones (Legacy guard, slowZones is now empty)
  for (const zone of state.allZones) {
    if (zone?.userData.lightning) {
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

  const distFromCenter = Math.sqrt(nextPosition.x ** 2 + nextPosition.z ** 2);
  if (distFromCenter > WORLD_SAFE_RADIUS) {
    const boundaryDir = nextPosition.clone().normalize();
    boundaryDir.y = 0;

    nextPosition.copy(boundaryDir.multiplyScalar(WORLD_SAFE_RADIUS));

    const velocityDot = state.velocity.dot(boundaryDir);
    if (velocityDot > 0) {
      state.velocity.sub(boundaryDir.multiplyScalar(velocityDot));
    }
  }

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
          if (!item) return;

          // Get world position before removing from player
          const worldPos = new THREE.Vector3();
          item.getWorldPosition(worldPos);

          // Return to scene safely
          scene.add(item);
          item.position.copy(worldPos);
          item.position.y = 0.3; // Floating height

          // Reset local transforms
          item.scale.set(1, 1, 1);
          item.rotation.set(0, 0, 0);
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
            startTime: Date.now(),
            bounces: 0,
          });
          item.userData.scatteredAt = Date.now();
          state.trash.push(item);
        });
      }

      // Damage
      if (now - state.lastDamageTime > OBSTACLE_DAMAGE_COOLDOWN) {
        state.lastDamageTime = now;
        if (onDamage) onDamage();
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

        if (setHp) {
          setHp((hp) => {
            const nextHp = hp - 1;
            if (nextHp <= 0) {
              if (endGame) endGame("death");
            }
            return nextHp;
          });
        }
      }
    }
  }

  player.position.copy(nextPosition);
  player.position.y = 0.3;

  // Hit flash - ONLY apply to boat mesh, not collected trash
  const isHit = Date.now() - state.hitTime < 200;
  player.children.forEach((child) => {
    // Only traverse the actual boat model, not collected trashGroups
    if (child.userData.type !== "trashGroup") {
      child.traverse((o) => {
        if (o.isMesh && o.material) {
          if (isHit) {
            o.material.transparent = true;
            o.material.opacity = 0.5;
            if (o.material.color) {
              o.material.emissive = new THREE.Color(0xff0000);
              o.material.emissiveIntensity = 0.5;
            }
          } else {
            // Restore native transparency if it was there before
            o.material.transparent = o.userData.originalTransparent ?? false;
            o.material.opacity = o.userData.originalOpacity ?? 1;
            if (o.material.emissive) o.material.emissiveIntensity = 0;
          }
        }
      });
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
      // Cooldown for scattered items
      const now = Date.now();
      if (t.userData.scatteredAt && now - t.userData.scatteredAt < 2000) {
        return true;
      }

      if (state.inventory.length >= PLAYER_CAPACITY) {
        const now = Date.now();
        if (now - state.lastInventoryFullWarning > 500) {
          state.lastInventoryFullWarning = now;
          if (setInventoryFull) setInventoryFull(true);
          setTimeout(() => setInventoryFull && setInventoryFull(false), 800);
        }
        return true;
      }
      state.inventory.push(t);
      scene.remove(t);
      player.add(t);
      if (onPickup) onPickup();
      t.position.set(0, 0.8 + state.inventory.length * 0.25, -0.4);
      t.scale.set(1, 1, 1);
      if (setInventoryCount) setInventoryCount(state.inventory.length);
      if (setInventoryFull) setInventoryFull(false);
      if (setHudPulse) setHudPulse(true);
      setTimeout(() => setHudPulse && setHudPulse(false), 150);
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
      if (onItemDeposited && t.userData.trashType) {
        onItemDeposited(t.userData.trashType);
      }
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
    if (setInventoryCount) setInventoryCount(0);
    state.recycledInStorage += count;
    if (setRecycledCount) setRecycledCount(state.recycledInStorage);

    // Dùng totalTrashCount từ state nếu có
    const _winTarget = state.totalTrashCount || TOTAL_TRASH;
    if (state.recycledInStorage >= _winTarget)
      setTimeout(() => endGame && endGame("win"), 800);
    if (setHudPulse) setHudPulse(true);
    setTimeout(() => setHudPulse && setHudPulse(false), 200);
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
