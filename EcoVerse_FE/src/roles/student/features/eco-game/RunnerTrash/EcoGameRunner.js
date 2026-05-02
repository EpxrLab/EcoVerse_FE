/**
 * EcoGameRunner - Stage 1: Endless Runner
 *
 * 3-lane endless runner where the player collects trash and avoids obstacles.
 * Uses AABB collision detection and GSAP for smooth animations.
 */
import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { SPAWNABLE_TRASH } from "../EcoGameStateManager";
import { DEFAULT_LEVEL_CONFIG } from "../gameConfig";

// ─── Fixed Constants (not configurable) ──────────────────────────────────────

const LANE_WIDTH = 2.5;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH]; // left, center, right
const GROUND_SEGMENT_LENGTH = 50;
const OBSTACLE_TYPES = [
  { name: "crate", color: 0x8d6e63, w: 1.0, h: 1.0, d: 1.0 },
  { name: "barrier", color: 0xef5350, w: 1.8, h: 1.2, d: 0.4 },
];

export default class EcoGameRunner {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {EcoGameStateManager} stateManager
   * @param {object} config - Runner config from API (runner sub-object of GameLevelConfig)
   * @param {Array} wasteItems - Preloaded waste items from API with 3D models
   * @param {number} itemCount - Total items to spawn (from API)
   */
  constructor(
    scene,
    camera,
    stateManager,
    config = {},
    wasteItems = [],
    itemCount = 0,
  ) {
    this.scene = scene;
    this.camera = camera;
    this.stateManager = stateManager;

    // Merge provided config with defaults
    const defaults = DEFAULT_LEVEL_CONFIG.runner;
    this.config = { ...defaults, ...config };

    // API wasteItems with preloaded 3D models
    this.wasteItems = wasteItems;
    this.maxTrashToSpawn =
      config.itemCount > 0 ? config.itemCount : itemCount > 0 ? itemCount : 10;
    this.totalTrashSpawned = 0;

    this.player = null;
    this.currentLane = 1; // 0=left, 1=center, 2=right
    this.isJumping = false;
    this.isRunning = false;
    this.speed = this.config.baseSpeed;
    this.distance = 0;
    this.spawnTimer = 0;
    this.nextSpawnTime = 1.5;
    this.gameOver = false;

    this.trashItems = [];
    this.obstacles = [];
    this.groundSegments = [];
    this.decorations = [];

    // Touch handling
    this.touchStartX = 0;
    this.touchStartY = 0;

    // Audio
    this.audioListener = null;
    this.bgm = null;
    this.collectSound = null;
    this.gameOverSound = null;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
  }

  // ─── Initialization ─────────────────────────────────────────────────────────

  async init(onProgress = null) {
    return new Promise((resolve) => {
      const manager = new THREE.LoadingManager();

      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        if (onProgress) {
          onProgress(Math.round((itemsLoaded / itemsTotal) * 100));
        }
      };

      manager.onLoad = () => {
        console.log("--- RUNNER ASSETS LOADED ---");
        resolve();
      };

      manager.onError = (url) => {
        console.warn("Error loading asset:", url);
      };

      console.log("--- RUNNER START WITH CONFIG ---", this.config);
      this._setupCamera(); // Camera first for audio listener
      this._createGround(manager);
      this._createPlayer(manager);
      this._createEnvironment();
      this._loadAudio(manager); // Load and start audio
      this._addEventListeners();

      this.isRunning = true;
      this.gameOver = false;
      this.speed = this.config.baseSpeed;
      this.distance = 0;
      this.spawnTimer = 0;
      this.nextSpawnTime = 1.0;

      // Cache for dynamically loaded 3D models from API imagePresignedUrl
      this.modelCache = {};

      // Load static obstacle model (Rock)
      const loader = new GLTFLoader(manager);
      loader.load(
        "/assets/rock.glb",
        (gltf) => {
          this.rockModel = gltf.scene;
          // Optimization: Pre-calculate normalization for obstacles
          const box = new THREE.Box3().setFromObject(this.rockModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            this.rockModel.scale.setScalar(1.5 / maxDim); // Target standard width
          }
          this.rockModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          console.log("--- RUNNER OBSTACLE MODEL LOADED ---");
        },
        undefined,
        (err) =>
          console.warn("Failed to load /assets/rock.glb for runner", err),
      );
    });
  }

  _createGround(manager) {
    // Load the 3D map model
    const loader = new GLTFLoader(manager);
    const mapPath = "/assets/Runner_map_2.glb"; // Configured map path

    loader.load(
      mapPath,
      (gltf) => {
        this.mapModel = gltf.scene;

        // Rotate map 180 degrees on Y to face the correct direction
        this.mapModel.rotation.y = Math.PI;

        // Find road/ground meshes with priority
        let roadMeshes = [];
        const secondaryMeshes = [];

        const primaryKeywords = ["daolu", "road", "street", "way", "path"];
        const secondaryKeywords = [
          "ground",
          "floor",
          "dixing",
          "ditu",
          "terrain",
        ];

        this.mapModel.traverse((child) => {
          if (child.isMesh) {
            const nameLower = child.name.toLowerCase();
            if (primaryKeywords.some((k) => nameLower.includes(k))) {
              roadMeshes.push(child);
            } else if (secondaryKeywords.some((k) => nameLower.includes(k))) {
              secondaryMeshes.push(child);
            }
          }
        });

        // Use primary meshes if available, otherwise fallback to secondary
        const targetMeshes =
          roadMeshes.length > 0 ? roadMeshes : secondaryMeshes;
        const finalUsedMeshes =
          targetMeshes.length > 0 ? targetMeshes : [this.mapModel];

        console.log(`--- MAP LOADED: ${mapPath} ---`, {
          primaryFound: roadMeshes.length,
          secondaryFound: secondaryMeshes.length,
          usingType:
            roadMeshes.length > 0
              ? "PRIMARY"
              : secondaryMeshes.length > 0
                ? "SECONDARY"
                : "FULL_MODEL",
        });

        // Measure coordinates
        this.mapModel.updateMatrixWorld(true);

        // Calculate a combined bounding box for target meshes
        const roadBoxInitial = new THREE.Box3();
        finalUsedMeshes.forEach((mesh) => {
          const meshBox = new THREE.Box3().setFromObject(mesh);
          roadBoxInitial.union(meshBox);
        });

        const roadSizeInitial = roadBoxInitial.getSize(new THREE.Vector3());
        const roadCenterInitial = roadBoxInitial.getCenter(new THREE.Vector3());

        // Scale map so the ROAD is 10 units wide
        // Note: We use the combined width of all road segments
        const scale = 10 / roadSizeInitial.x;
        this.mapModel.scale.setScalar(scale);

        // Update world matrix after scaling to get the final unified properties
        this.mapModel.updateMatrixWorld(true);

        const finalBox = new THREE.Box3();
        finalUsedMeshes.forEach((mesh) => {
          const meshBox = new THREE.Box3().setFromObject(mesh);
          finalBox.union(meshBox);
        });

        const roadSizeFinal = finalBox.getSize(new THREE.Vector3());
        const roadCenterFinal = finalBox.getCenter(new THREE.Vector3());

        this.modelLength = roadSizeFinal.z;

        // Calculate configuration based on actual map length
        // MAP_START_OFFSET: How far ahead of the player the map starts appearing
        const MAP_START_OFFSET = 1210;

        // Set maxDistance to match the model's road length
        // Game ends when player reaches approximately the end of the map
        this.config.maxDistance = this.modelLength + MAP_START_OFFSET - 1170;

        console.log("--- RUNNER MAP CONFIG ---", {
          mesh: finalUsedMeshes[0]?.name || "FULL_MODEL",
          length: this.modelLength.toFixed(1),
          maxDistance: this.config.maxDistance.toFixed(1),
        });

        // Alignment: Center the road at X=0, put the front edge at -MAP_START_OFFSET
        // roadCenterFinal.z is the center in world space AFTER scale but BEFORE position change
        // roadSizeFinal.z / 2 is distance from center to edge.
        // So center at -(roadSizeFinal.z/2) + roadCenterFinal.z puts the FRONT edge at 0?
        // Wait, let's just use local coordinates logic:
        // We want WorldZ = -MAP_START_OFFSET to be where local FrontZ is.
        // FrontZ is usually roadCenterFinal.z - roadSizeFinal.z/2 ?
        // Depends on orientation. Since we rotated 180, let's just use the center.

        this.mapModel.position.set(
          -roadCenterFinal.x,
          -(roadCenterFinal.y - roadSizeFinal.y / 2) - 0.7,
          -roadCenterFinal.z - MAP_START_OFFSET,
        );

        this.mapModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.mapModel);
        this.mapSegments = [this.mapModel];
      },
      undefined,
      (error) => {
        console.error(`Failed to load ${mapPath}:`, error);

        // Fallback if load fails
        this.modelLength = 500;
        this.config.maxDistance = 500;
      },
    );

    // Invisible ground segments for gameplay collision (physics)
    // We keep these to ensure there's always a floor even if the model is loading
    for (let i = 0; i < 10; i++) {
      const groundGeo = new THREE.BoxGeometry(
        LANE_WIDTH * 3 + 2,
        0.2,
        GROUND_SEGMENT_LENGTH,
      );
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x607d8b });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.set(0, -0.8, -i * GROUND_SEGMENT_LENGTH + 10);
      ground.visible = false;
      this.scene.add(ground);
      this.groundSegments.push(ground);
    }
  }

  _createPlayer(manager) {
    this.player = new THREE.Group();
    this.player.position.set(LANES[this.currentLane], 0, 0);
    this.scene.add(this.player);

    const loader = new GLTFLoader(manager);
    loader.load(
      "/assets/Chacracter.glb",
      (gltf) => {
        this.playerModel = gltf.scene;

        // Adjust rotation to face forward in the runner path.
        this.playerModel.rotation.y = Math.PI;

        // Tăng kích thước model
        this.playerModel.scale.setScalar(2);

        this.playerModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false; // Disable self-shadowing acne
            
            // Ensure textures and colors render correctly
            if (child.material) {
              if (child.material.map) {
                child.material.map.colorSpace = THREE.SRGBColorSpace;
              }
              // Prevent washing out from high intensity lights
              if (child.material.roughness !== undefined) child.material.roughness = 1.0;
              if (child.material.metalness !== undefined) child.material.metalness = 0.0;
            }
          }
        });

        this.player.add(this.playerModel);

        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.playerModel);

          // Play a run animation if found, else play the first animation
          let runClip = gltf.animations.find((clip) =>
            clip.name.toLowerCase().includes("run"),
          );
          if (!runClip) runClip = gltf.animations[0];

          if (runClip) {
            const action = this.mixer.clipAction(runClip);
            action.play();
          }
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load Chacracter.glb:", error);
      },
    );
  }

  _createEnvironment() {
    // Ambient light - soft overall light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    this._ambientLight = ambient;

    // Hemisphere light - simulates sky/ground bounce for better colors
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this.scene.add(hemiLight);

    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.0005; // Fix shadow acne
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    this.scene.add(dirLight);
    this._dirLight = dirLight;

    // Sky color
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 40, 120);
  }

  _setupCamera() {
    this.camera.position.set(0, 5, 8);
    this.camera.lookAt(0, 1, -20);

    // Setup Audio Listener
    if (!this.audioListener) {
      this.audioListener = new THREE.AudioListener();
      this.camera.add(this.audioListener);
    }
  }

  _loadAudio(manager) {
    const audioLoader = new THREE.AudioLoader(manager);

    // Background Music
    this.bgm = new THREE.Audio(this.audioListener);
    audioLoader.load(
      "/assets/audio/music_game.mp3",
      (buffer) => {
        this.bgm.setBuffer(buffer);
        this.bgm.setLoop(true);
        this.bgm.setVolume(0.4);
        if (this.isRunning && !this.gameOver) {
          this.bgm.play();
        }
      },
      undefined,
      (err) => console.warn("BGM not found at /assets/audio/bgm_runner.mp3"),
    );

    // Collection Sound
    this.collectSound = new THREE.Audio(this.audioListener);
    audioLoader.load(
      "/assets/audio/collect.mp3",
      (buffer) => {
        this.collectSound.setBuffer(buffer);
        this.collectSound.setVolume(0.5);
      },
      undefined,
      (err) =>
        console.warn("Collect sound not found at /assets/audio/collect.mp3"),
    );

    // Game Over Sound
    this.gameOverSound = new THREE.Audio(this.audioListener);
    audioLoader.load(
      "/assets/audio/gameover.mp3",
      (buffer) => {
        this.gameOverSound.setBuffer(buffer);
        this.gameOverSound.setVolume(0.6);
      },
      undefined,
      (err) =>
        console.warn("GameOver sound not found at /assets/audio/gameover.mp3"),
    );
  }

  // ─── Event Handling ─────────────────────────────────────────────────────────

  _addEventListeners() {
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("touchstart", this._onTouchStart, {
      passive: true,
    });
    window.addEventListener("touchend", this._onTouchEnd, { passive: true });
  }

  _removeEventListeners() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("touchstart", this._onTouchStart);
    window.removeEventListener("touchend", this._onTouchEnd);
  }

  _onKeyDown(e) {
    if (
      this.audioListener &&
      this.audioListener.context.state === "suspended"
    ) {
      this.audioListener.context.resume();
    }

    if (this.gameOver || !this.isRunning) return;

    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        this._switchLane(-1);
        break;
      case "ArrowRight":
      case "KeyD":
        this._switchLane(1);
        break;
      case "ArrowUp":
      case "KeyW":
      case "Space":
        this._jump();
        break;
    }
  }

  _onTouchStart(e) {
    if (
      this.audioListener &&
      this.audioListener.context.state === "suspended"
    ) {
      this.audioListener.context.resume();
    }

    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  _onTouchEnd(e) {
    if (
      this.audioListener &&
      this.audioListener.context.state === "suspended"
    ) {
      this.audioListener.context.resume();
    }

    if (this.gameOver || !this.isRunning) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      this._switchLane(dx > 0 ? 1 : -1);
    } else if (dy < -30) {
      this._jump();
    }
  }

  _switchLane(direction) {
    const newLane = this.currentLane + direction;
    if (newLane < 0 || newLane > 2) return;

    this.currentLane = newLane;
    gsap.to(this.player.position, {
      x: LANES[this.currentLane],
      duration: 0.2,
      ease: "power2.out",
    });
  }

  _jump() {
    if (this.isJumping) return;
    this.isJumping = true;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isJumping = false;
      },
    });

    tl.to(this.player.position, {
      y: this.config.jumpHeight,
      duration: this.config.jumpDuration * 0.45,
      ease: "power2.out",
    });
    tl.to(this.player.position, {
      y: 0,
      duration: this.config.jumpDuration * 0.55,
      ease: "power2.in",
    });
  }

  // ─── Spawning ───────────────────────────────────────────────────────────────

  _spawnTrash() {
    // Don't spawn more than itemCount
    if (this.totalTrashSpawned >= this.maxTrashToSpawn) return;

    const lane = Math.floor(Math.random() * 3);
    let mesh;
    let trashUserData;

    const apiItems = this.wasteItems.filter(
      (w) => w.presignedModel3dUrl || w.imagePresignedUrl,
    );
    if (apiItems.length > 0) {
      this.totalTrashSpawned++;
      // Pick a random item from API wasteItems
      const apiItem = apiItems[Math.floor(Math.random() * apiItems.length)];

      const currentModelUrl =
        apiItem.presignedModel3dUrl || apiItem.imagePresignedUrl;

      const trashUserData = {
        type: "trash",
        trashType: {
          id: apiItem.wasteItemId,
          name: apiItem.itemName,
          bin: apiItem.wasteCategory?.toLowerCase() || "recycle",
          color: 0x2196f3,
          imageUrl: apiItem.imagePresignedUrl,
          preloadedModel: currentModelUrl,
          modelUrl: currentModelUrl,
          funFact: apiItem.funFact, // Captured for result display
        },
        wasteItemId: apiItem.wasteItemId,
        wasteCategory: apiItem.wasteCategory,
        subCategoryCode: apiItem.subCategoryCode,
        subCategoryDisplayName: apiItem.subCategoryDisplayName,
        collected: false,
      };

      const finalizeMesh = (model) => {
        const traskRoot = new THREE.Group();

        // 1. Normalize model scale based on its internal bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 1.0; // Standardize all items for the runner
        if (maxDim > 0) {
          model.scale.setScalar(targetSize / maxDim);
        }

        // 2. Center the model visually within the trashRoot
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x * model.scale.x;
        model.position.y = -center.y * model.scale.y;
        model.position.z = -center.z * model.scale.z;

        // Tăng cường độ sáng của model (emissive)
        model.traverse((child) => {
          if (child.isMesh && child.material && child.material.emissive) {
            child.material.emissive.setHex(0x555555);
            child.material.emissiveIntensity = 0.2;
          }
        });

        traskRoot.add(model);

        // 3. Create Aura on the ROOT group (so it stays at radius 0.8-0.9 regardless of model scale)
        const catColors = {
          RECYCLABLE: 0x2196f3,
          ORGANIC: 0x4caf50,
          HAZARDOUS: 0xf44336,
          GENERAL: 0xeeeeee,
        };
        const auraGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.4, 16, 1, true);
        const auraMat = new THREE.MeshBasicMaterial({
          color: catColors[apiItem.wasteCategory] || 0xffffff,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.position.y = 0.0; // relative to traskRoot center
        traskRoot.add(aura);

        gsap.to(auraMat, {
          opacity: 0.5,
          duration: 1.2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });

        // 4. Final positioning in scene
        traskRoot.position.set(LANES[lane], 0.6, -60);
        traskRoot.userData = {
          ...trashUserData,
          collisionTarget: model, // Reference to model for precise collision checks
        };

        this.scene.add(traskRoot);
        this.trashItems.push(traskRoot);

        // Spin animation for the whole container
        gsap.to(traskRoot.rotation, {
          y: Math.PI * 2,
          duration: 2,
          repeat: -1,
          ease: "none",
        });
      };

      // Load dynamically using the best available URL if not cached
      if (this.modelCache[currentModelUrl]) {
        finalizeMesh(this.modelCache[currentModelUrl].clone());
      } else {
        const loader = new GLTFLoader();
        loader.load(
          currentModelUrl,
          (gltf) => {
            this.modelCache[currentModelUrl] = gltf.scene;
            // Only finalize if game is still active
            if (!this.gameOver) {
              finalizeMesh(gltf.scene.clone());
            }
          },
          undefined,
          (err) => {
            console.error("URL gây lỗi:", currentModelUrl);
            console.error("Thông tin lỗi từ Loader:", err);
            // finalizeMesh(this._createBoxTrashMesh(0xff0000));
          },
        );
      }
    } else {
      this.totalTrashSpawned++;
      // Fallback to hardcoded geometry
      const trashType =
        SPAWNABLE_TRASH[Math.floor(Math.random() * SPAWNABLE_TRASH.length)];
      switch (trashType.id) {
        case "plastic_bottle":
          mesh = this._createBottleMesh(trashType.color);
          break;
        case "can":
          mesh = this._createCanMesh(trashType.color);
          break;
        default:
          mesh = this._createBoxTrashMesh(trashType.color);
          break;
      }
      trashUserData = { type: "trash", trashType, collected: false };
    }

    mesh.position.set(LANES[lane], 0.6, -60);
    mesh.userData = trashUserData;
    this.scene.add(mesh);
    this.trashItems.push(mesh);

    // Spin animation
    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 2,
      repeat: -1,
      ease: "none",
    });
  }

  _spawnObstacle() {
    const obsType =
      OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const lane = Math.floor(Math.random() * 3);

    let mesh;
    if (this.rockModel) {
      mesh = this.rockModel.clone(true);

      // Randomize rotation for variety
      mesh.rotation.y = Math.random() * Math.PI * 2;

      // Scale variation (0.8x to 1.1x of the already normalized base)
      const scaleVar = 0.8 + Math.random() * 0.3;
      mesh.scale.multiplyScalar(scaleVar);

      // Positioning - sit on ground
      mesh.position.set(LANES[lane], 0.0, -60);
    } else {
      // Fallback to primitive
      const geo = new THREE.BoxGeometry(obsType.w, obsType.h, obsType.d);
      const mat = new THREE.MeshStandardMaterial({
        color: obsType.color,
        roughness: 0.6,
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(LANES[lane], obsType.h / 2 - 0.7, -60);
    }

    mesh.castShadow = true;
    mesh.userData = {
      type: "obstacle",
      obsType,
      lane: lane, // Critical for lane-aware collision
      collisionTarget: mesh,
    };

    this.scene.add(mesh);
    this.obstacles.push(mesh);
  }

  _createBottleMesh(color) {
    const group = new THREE.Group();
    // Body (cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.6, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    // Cap
    const capGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.12, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.36;
    group.add(cap);

    return group;
  }

  _createCanMesh(color) {
    const geo = new THREE.CylinderGeometry(0.18, 0.18, 0.5, 12);
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.6,
      roughness: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  _createBoxTrashMesh(color) {
    const geo = new THREE.BoxGeometry(0.4, 0.3, 0.4);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  // ─── Collision Detection ────────────────────────────────────────────────────

  _checkCollisions() {
    const playerBox = new THREE.Box3().setFromObject(this.player);
    // Shrink player box slightly for better feel
    playerBox.min.x += 0.15;
    playerBox.max.x -= 0.15;
    playerBox.min.z += 0.1;
    playerBox.max.z -= 0.1;

    // Check trash collisions
    for (let i = this.trashItems.length - 1; i >= 0; i--) {
      const trash = this.trashItems[i];
      if (trash.userData.collected) continue;

      // PERFORMANCE & BUG FIX: Skip collision checks for items far away (spawning at -60)
      // Only check items that are within a reasonable proximity to the player (at z=0)
      if (trash.position.z < -5) continue;

      // Force update matrix to ensure the bounding box is calculated at the actual current position
      // This prevents "teleporting" collection bugs where new items default to world origin (0,0,0)
      trash.updateMatrixWorld(true);

      // Check trash collisions using either the specific collisionTarget (model only) OR the whole object
      const collisionTarget = trash.userData.collisionTarget || trash;
      const trashBox = new THREE.Box3().setFromObject(collisionTarget);

      if (playerBox.intersectsBox(trashBox)) {
        trash.userData.collected = true;
        // this.stateManager.addTrash(trash.userData.trashType); // Removed: Orchestrator handles this via callback

        // Collection animation
        gsap.to(trash.scale, {
          x: 0,
          y: 2,
          z: 0,
          duration: 0.3,
          ease: "back.in",
          onComplete: () => {
            this.scene.remove(trash);
            this.trashItems.splice(this.trashItems.indexOf(trash), 1);
          },
        });

        // Emit collection event for HUD - Pass the item info, not just count
        if (this._onTrashCollected) {
          this._onTrashCollected(trash.userData.trashType);
        }

        // Play collection sound
        if (this.collectSound && this.collectSound.buffer) {
          if (this.collectSound.isPlaying) this.collectSound.stop();
          this.collectSound.play();
        }
      }
    }

    // Check obstacle collisions (only if not jumping high enough)
    if (!this.isJumping || this.player.position.y < 1.0) {
      for (const obstacle of this.obstacles) {
        // PERFORMANCE & BUG FIX: Only check items close to player
        if (obstacle.position.z < -5) continue;

        // LANE-AWARE COLLISION: Only collide if in the same lane
        // This stops rocks in adjacent lanes from ending the game.
        if (obstacle.userData.lane !== this.currentLane) continue;

        const obsBox = new THREE.Box3().setFromObject(obstacle);
        // Shrink obstacle box for more forgiving gameplay
        obsBox.expandByScalar(-0.15);

        if (playerBox.intersectsBox(obsBox)) {
          this._handleGameOver();
          return;
        }
      }
    }
  }

  _handleGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.isRunning = false;

    // Stop BGM
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
    }

    // Play Game Over sound
    if (this.gameOverSound && this.gameOverSound.buffer) {
      this.gameOverSound.play();
    }

    // Hit effect
    gsap.to(this.player.rotation, {
      x: -0.3,
      duration: 0.3,
      ease: "power2.out",
    });

    // Camera shake
    const origPos = { x: this.camera.position.x, y: this.camera.position.y };
    gsap.to(this.camera.position, {
      x: origPos.x + 0.2,
      y: origPos.y + 0.1,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: "none",
      onComplete: () => {
        this.camera.position.x = origPos.x;
        this.camera.position.y = origPos.y;
      },
    });

    // Transition to Stage 2 after delay
    setTimeout(() => {
      this.stateManager.distance = this.distance;
      if (this._onStageComplete) {
        this._onStageComplete("win", this.stateManager.getTotalTrashCount());
      }
    }, 1500);
  }

  // ─── Update Loop ────────────────────────────────────────────────────────────

  update(delta) {
    // Update player animation if mixer exists
    if (this.mixer && this.isRunning && !this.gameOver) {
      this.mixer.update(delta);
    }

    if (!this.isRunning || this.gameOver) return;

    // Increase speed over time (configurable)
    this.speed = Math.min(
      this.speed + this.config.speedIncrement,
      this.config.maxSpeed,
    );
    const moveAmount = this.speed * delta;

    // Update distance
    this.distance += moveAmount;
    this.stateManager.distance = this.distance;

    // Check if we should end stage because all trash has spawned and passed
    if (
      this.totalTrashSpawned >= this.maxTrashToSpawn &&
      this.trashItems.length === 0
    ) {
      if (!this.gameOver) {
        this.gameOver = true;
        this.isRunning = false;

        // Transition to Stage 2 after delay
        setTimeout(() => {
          this.stateManager.distance = this.distance;
          if (this._onStageComplete) {
            this._onStageComplete(
              "win",
              this.stateManager.getTotalTrashCount(),
            );
          }
        }, 800);
        return;
      }
    }

    // Check if reached max distance (configurable)
    if (this.distance >= this.config.maxDistance) {
      this.isRunning = false;
      this.stateManager.distance = this.distance;
      setTimeout(() => {
        if (this._onStageComplete)
          this._onStageComplete("win", this.stateManager.getTotalTrashCount());
      }, 500);
      return;
    }

    // Move ground segments
    for (const seg of this.groundSegments) {
      seg.position.z += moveAmount;
      if (seg.position.z > GROUND_SEGMENT_LENGTH + 10) {
        seg.position.z -= GROUND_SEGMENT_LENGTH * this.groundSegments.length;
      }
    }

    // Move the map segments synchronously with the ground
    if (this.mapSegments && this.mapSegments.length > 0) {
      for (const segment of this.mapSegments) {
        segment.position.z += moveAmount;
        // No wrap - single segment only
      }
    }

    // Move decorations (buildings, windows, lane markings)
    for (const dec of this.decorations) {
      dec.position.z += moveAmount;
      if (dec.position.z > GROUND_SEGMENT_LENGTH + 10) {
        dec.position.z -= 100; // wrap back to match building row span
      }
    }

    // Move trash items toward player
    for (let i = this.trashItems.length - 1; i >= 0; i--) {
      const trash = this.trashItems[i];
      trash.position.z += moveAmount;
      if (trash.position.z > 15) {
        this.scene.remove(trash);
        this.trashItems.splice(i, 1);
      }
    }

    // Move obstacles toward player
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.position.z += moveAmount;
      if (obs.position.z > 15) {
        this.scene.remove(obs);
        this.obstacles.splice(i, 1);
      }
    }

    // Spawn logic (configurable intervals and obstacle ratio)
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.spawnTimer = 0;
      this.nextSpawnTime =
        this.config.spawnIntervalMin +
        Math.random() *
        (this.config.spawnIntervalMax - this.config.spawnIntervalMin);

      // prioritized trash spawning if we haven't reached the limit
      const remainingTrash = this.maxTrashToSpawn - this.totalTrashSpawned;
      const remainingDistance = this.config.maxDistance - this.distance;

      // If we are getting close to the end, force trash spawns
      const forceTrash =
        remainingTrash > 0 && remainingDistance < remainingTrash * 15;

      if (
        remainingTrash > 0 &&
        (forceTrash || Math.random() >= this.config.obstacleRatio)
      ) {
        this._spawnTrash();
      } else {
        this._spawnObstacle();
      }
    }

    // Collision detection
    this._checkCollisions();

    // Update HUD
    if (this._onDistanceUpdate) {
      this._onDistanceUpdate(this.distance, this.speed);
    }
  }

  // ─── Callbacks ──────────────────────────────────────────────────────────────

  onTrashCollected(callback) {
    this._onTrashCollected = callback;
  }

  onDistanceUpdate(callback) {
    this._onDistanceUpdate = callback;
  }

  onStageComplete(callback) {
    this._onStageComplete = callback;
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  dispose() {
    this._removeEventListeners();

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }

    // Stop and cleanup audio
    if (this.bgm && this.bgm.isPlaying) this.bgm.stop();
    if (this.collectSound && this.collectSound.isPlaying)
      this.collectSound.stop();
    if (this.gameOverSound && this.gameOverSound.isPlaying)
      this.gameOverSound.stop();

    if (this.audioListener) {
      this.camera.remove(this.audioListener);
    }

    // Kill all GSAP animations on game objects
    gsap.killTweensOf(this.player?.position);
    gsap.killTweensOf(this.player?.rotation);

    // Remove all objects from scene
    const toRemove = [
      this.player,
      ...this.trashItems,
      ...this.obstacles,
      ...this.groundSegments,
      ...this.decorations,
      this._ambientLight,
      this._dirLight,
    ].filter(Boolean);

    toRemove.forEach((obj) => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.trashItems = [];
    this.obstacles = [];
    this.groundSegments = [];
    this.decorations = [];
    this.player = null;

    // Dispose the loaded GLB map model
    if (this.mapModel) {
      this.scene.remove(this.mapModel);
      this.mapModel.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      this.mapModel = null;
    }
  }
}
