/**
 * EcoGameSorter - Stage 2: Sorting Game
 *
 * 3D drag-and-drop sorting game using THREE.Raycaster.
 * Players sort collected trash into the correct bins.
 */
import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  DynamicBinTypes,
} from "./EcoGameStateManager";
import { DEFAULT_LEVEL_CONFIG } from "./gameConfig";

// ─── Constants ───────────────────────────────────────────────────────────────

const TABLE_SIZE = { w: 8, h: 0.2, d: 3 };
const TABLE_Y = 0;
const ITEM_Y = TABLE_Y + 0.5;
const DRAG_PLANE_Y = TABLE_Y + 0.5;

export default class EcoGameSorter {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {EcoGameStateManager} stateManager
   * @param {THREE.WebGLRenderer} renderer
   * @param {object} config - Sorter config from API (sorter sub-object of GameLevelConfig)
   */
  constructor(
    scene,
    camera,
    stateManager,
    renderer,
    config = {},
    levelConfig = {},
  ) {
    this.scene = scene;
    this.camera = camera;
    this.stateManager = stateManager;
    this.renderer = renderer;

    // Merge provided config with defaults
    const defaults = DEFAULT_LEVEL_CONFIG.sorter;
    this.config = { ...defaults, ...config };

    // Categories for bins
    this.wasteCategories = levelConfig.wasteCategories || [
      "RECYCLABLE",
      "ORGANIC",
      "HAZARDOUS",
      "GENERAL",
    ];

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_PLANE_Y);

    this.trashMeshes = [];
    this.binMeshes = [];
    this.binLabels = [];
    this.selectedObject = null;
    this.isDragging = false;
    this.originalPosition = new THREE.Vector3();

    this.itemsRemaining = 0;
    this.score = { correct: 0, wrong: 0 };

    // Timer support
    this.timeLimit = this.config.timeLimit;
    this.timeRemaining = this.config.timeLimit;
    this.timerActive = this.config.timeLimit > 0;

    this._startTime = 0;
    this._accumulatedPausedTime = 0;
    this._pauseStartTime = 0;
    this._isPaused = false;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onResize = this._onResize.bind(this);

    this.domRect = null;
    this._timerId = null;

    // Audio
    this.audioListener = null;
    this.correctSound = null;
    this.wrongSound = null;
  }

  // ─── Initialization ─────────────────────────────────────────────────────────

  async init(onProgress = null) {
    this._clearScene();
    this._createEnvironment();
    this._createTable();
    this._createBins();
    await this._createTrashItems(onProgress);
    this._setupCamera();
    this._setupAudio();
    this._addEventListeners();
    this._onResize(); // Initial rect cache

    if (this.timerActive) {
      this._startTime = Date.now();
      this._startTimer();
    }
  }

  _setupAudio() {
    // Find or create AudioListener on camera
    this.audioListener = this.camera.children.find((c) => c.type === "AudioListener");
    if (!this.audioListener) {
      this.audioListener = new THREE.AudioListener();
      this.camera.add(this.audioListener);
    }

    const audioLoader = new THREE.AudioLoader();

    // Correct Sound
    this.correctSound = new THREE.Audio(this.audioListener);
    audioLoader.load(
      "/assets/audio/correct.mp3",
      (buffer) => {
        if (this.correctSound) {
          this.correctSound.setBuffer(buffer);
          this.correctSound.setVolume(0.6);
        }
      },
      undefined,
      (err) => console.warn("Sorter: correct.mp3 not found", err)
    );

    // Wrong Sound
    this.wrongSound = new THREE.Audio(this.audioListener);
    audioLoader.load(
      "/assets/audio/Wrong.mp3",
      (buffer) => {
        if (this.wrongSound) {
          this.wrongSound.setBuffer(buffer);
          this.wrongSound.setVolume(0.5);
        }
      },
      undefined,
      (err) => console.warn("Sorter: Wrong.mp3 not found", err)
    );
  }

  _playSfx(sfx) {
    if (!sfx || !sfx.buffer) return;

    // Resume context if suspended (browser policy)
    if (this.audioListener && this.audioListener.context.state === "suspended") {
      this.audioListener.context.resume();
    }

    if (sfx.isPlaying) sfx.stop();
    sfx.play();
  }

  _startTimer() {
    this._timerId = setInterval(() => {
      if (!this.timerActive || this.timeRemaining <= 0 || this._isPaused)
        return;

      const now = Date.now();
      const elapsedMs = now - this._startTime - this._accumulatedPausedTime;
      const elapsedSec = elapsedMs / 1000;

      this.timeRemaining = Math.max(0, this.timeLimit - elapsedSec);

      if (this._onTimerUpdate) {
        this._onTimerUpdate(this.timeRemaining);
      }

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.timerActive = false;
        clearInterval(this._timerId);
        // Time's up — trigger completion with current score
        this._handleAllSorted();
      }
    }, 100);
  }

  _clearScene() {
    // Remove runner stage objects (the scene is shared)
    // The EcoGame orchestrator handles this
  }

  _createEnvironment() {
    // ─── 1. Lights ───
    const ambient = new THREE.AmbientLight(0xffffff, 0.7); // Much brighter ambient
    this.scene.add(ambient);
    this._ambientLight = ambient;

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    this.scene.add(dirLight);
    this._dirLight = dirLight;

    // Overhead industrial PointLights
    const lamp1 = new THREE.PointLight(0xfff4e0, 1.2, 20); // More white, brighter
    lamp1.position.set(-5, 8, -2);
    this.scene.add(lamp1);

    const lamp2 = new THREE.PointLight(0xfff4e0, 1.2, 20);
    lamp2.position.set(5, 8, -2);
    this.scene.add(lamp2);

    // ─── 2. Atmosphere ───
    this.scene.background = new THREE.Color(0xb0bec5); // Lighter gray-blue
    this.scene.fog = new THREE.Fog(0xb0bec5, 15, 45); // Lighter fog

    // ─── 3. Room Geometry ───
    const roomGroup = new THREE.Group();

    // Floor (Industrial Concrete - Lighter)
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x90a4ae,
      roughness: 0.7,
      metalness: 0.1,
    });
    this._floor = new THREE.Mesh(floorGeo, floorMat);
    this._floor.rotation.x = -Math.PI / 2;
    this._floor.position.y = -0.7;
    this._floor.receiveShadow = true;
    roomGroup.add(this._floor);

    // Back Wall (Lighter)
    const wallGeo = new THREE.PlaneGeometry(60, 30);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.9,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 14.3, -15);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Side Walls
    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-25, 14.3, 0);
    roomGroup.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(25, 14.3, 0);
    roomGroup.add(rightWall);

    // ─── 4. Factory Details ───

    // Windows (Brighter)
    const winGeo = new THREE.PlaneGeometry(8, 4);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xbbdefb,
      emissive: 0x90caf9,
      emissiveIntensity: 0.8,
    });

    for (let i = -2; i <= 2; i++) {
      const window = new THREE.Mesh(winGeo, winMat);
      window.position.set(i * 12, 10, -14.9);
      roomGroup.add(window);
    }

    // Structural Beams
    const beamGeo = new THREE.BoxGeometry(1, 30, 1);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x161925,
      metalness: 0.5,
      roughness: 0.2,
    });

    for (let i = -2; i <= 2; i++) {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(i * 12 + 6, 14.3, -14.5);
      roomGroup.add(beam);
    }

    this.scene.add(roomGroup);
  }

  _createTable() {
    const group = new THREE.Group();

    // 1. Table Top (Lighter Industrial Gray)
    const tableGeo = new THREE.BoxGeometry(
      TABLE_SIZE.w,
      TABLE_SIZE.h,
      TABLE_SIZE.d,
    );
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xeceff1, // Much lighter gray for visibility
      roughness: 0.2,
      metalness: 0.1,
    });
    this._table = new THREE.Mesh(tableGeo, tableMat);
    this._table.receiveShadow = true;
    this._table.castShadow = true;
    group.add(this._table);

    // 2. Metallic Frame
    const frameGeo = new THREE.BoxGeometry(
      TABLE_SIZE.w + 0.1,
      0.1,
      TABLE_SIZE.d + 0.1,
    );
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.8,
      roughness: 0.2,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -0.05;
    group.add(frame);

    // 3. Heary Duty Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.7, 0.3);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c22,
      metalness: 0.6,
      roughness: 0.3,
    });
    const legPositions = [
      [-TABLE_SIZE.w / 2 + 0.4, -0.45, TABLE_SIZE.d / 2 - 0.4],
      [TABLE_SIZE.w / 2 - 0.4, -0.45, TABLE_SIZE.d / 2 - 0.4],
      [-TABLE_SIZE.w / 2 + 0.4, -0.45, -TABLE_SIZE.d / 2 + 0.4],
      [TABLE_SIZE.w / 2 - 0.4, -0.45, -TABLE_SIZE.d / 2 + 0.4],
    ];

    this._tableLegs = [];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      group.add(leg);
      this._tableLegs.push(leg);
    });

    // 4. Hazard Stripe Detail
    const stripeGeo = new THREE.PlaneGeometry(TABLE_SIZE.w, 0.08);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 0, TABLE_SIZE.d / 2 + 0.01);
    group.add(stripe);

    group.position.set(0, TABLE_Y, 1);
    this.scene.add(group);
  }

  _createBins() {
    const numBins = this.wasteCategories.length;
    this.wasteCategories.forEach((catCode, index) => {
      const binType = DynamicBinTypes[catCode] || DynamicBinTypes.GENERAL;

      // Responsive bin layout
      const aspect = window.innerWidth / window.innerHeight;
      const responsiveWidth = aspect < 1 ? 6 : 14;
      const responsiveSpacing =
        numBins === 1 ? 0 : responsiveWidth / (numBins - 1);
      const responsiveStartX = -responsiveWidth / 2;

      const x = responsiveStartX + responsiveSpacing * index;
      const z = -4;

      const group = new THREE.Group();

      // ─── 1. Bin Base (Pedestal) ───
      const baseGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.1, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -1.05;
      group.add(base);

      // ─── 2. Bin Body (Tapered) ───
      const bodyGeo = new THREE.CylinderGeometry(1.0, 0.85, 2.0, 32, 1, false);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: binType.color,
        roughness: 0.3,
        metalness: 0.1,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // ─── 3. Inner Depth (The "Hole") ───
      const holeGeo = new THREE.CircleGeometry(0.92, 32);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.rotation.x = -Math.PI / 2;
      hole.position.y = 1.01;
      group.add(hole);

      // ─── 4. Top Rim (Premium Look) ───
      const rimGroup = new THREE.Group();

      // Outer ring
      const rimGeo = new THREE.TorusGeometry(1.0, 0.08, 16, 48);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        metalness: 0.8,
        roughness: 0.2,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rimGroup.add(rim);

      rimGroup.position.y = 1.0;
      group.add(rimGroup);

      // ─── 5. Label ───
      const label = this._createBinLabel(binType.name, catCode);
      // Place label ABOVE the rim and forward for maximum visibility
      label.position.set(0, 1.45, 0.9); // Slightly higher and more forward
      label.rotation.x = -Math.PI / 8; // Tilted more towards camera
      group.add(label);

      group.position.set(x, 0, z);
      group.userData = { type: "bin", binId: binType.id };

      this.scene.add(group);
      this.binMeshes.push(group);

      // Entrance animation
      group.scale.set(0, 0, 0);
      gsap.to(group.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.6,
        ease: "back.out(1.5)",
        delay: 0.2 + index * 0.1,
      });
    });
  }

  _createBinLabel(text, catCode) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200; // Even higher resolution
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    const iconMap = {
      ORGANIC: "🌿",
      RECYCLABLE: "♻️",
      HAZARDOUS: "☣️",
      GENERAL: "🗑️",
    };
    const icon = iconMap[catCode] || "❓";

    // Rounded background
    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    this._drawRoundedRect(ctx, 30, 30, 1140, 540, 90);
    ctx.fill();

    // Industrial border
    ctx.lineWidth = 25;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Icon (MUCH LARGER)
    ctx.font = "bold 320px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, 600, 200);

    // Text Label (Larger)
    ctx.fillStyle = "#111111";
    ctx.font = "bold 150px Arial, sans-serif";
    ctx.fillText(text.toUpperCase(), 600, 450);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(2.2, 1.1); // Increased from 1.4, 0.7
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.FrontSide,
    });

    return new THREE.Mesh(geo, mat);
  }

  _drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  async _createTrashItems(onProgress = null) {
    const items = this.stateManager.getTrashItemsForSorting();
    this.itemsRemaining = items.length;

    if (items.length === 0) {
      if (onProgress) onProgress(1);
      return;
    }

    const cols = Math.ceil(Math.sqrt(items.length));
    const spacing = TABLE_SIZE.w / (cols + 1);
    const gltfPromiseCache = {};

    let loadedCount = 0;

    const setupItem = async (item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = -TABLE_SIZE.w / 2 + spacing * (col + 1);
      const z = 1 - TABLE_SIZE.d / 2 + 0.5 + row * 0.8;

      const setupMesh = (mesh) => {
        mesh.position.set(x, ITEM_Y, z);
        mesh.userData = {
          type: "sortable",
          trashInfo: item,
          correctBin: item.bin,
          originalPos: new THREE.Vector3(x, ITEM_Y, z),
          baseScale: mesh.scale.clone(),
        };

        this.scene.add(mesh);
        this.trashMeshes.push(mesh);

        const s = mesh.scale.clone();
        mesh.scale.set(0, 0, 0);
        gsap.to(mesh.scale, {
          x: s.x,
          y: s.y,
          z: s.z,
          duration: 0.4,
          ease: "back.out(1.7)",
          delay: 0.5 + index * 0.08,
        });
      };

      const normalizeAndSetup = (originalModel) => {
        try {
          const model = originalModel.clone(true);
          const wrapper = new THREE.Group();

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) model.scale.multiplyScalar(0.6 / maxDim);

          const box2 = new THREE.Box3().setFromObject(model);
          const center = box2.getCenter(new THREE.Vector3());
          model.position.sub(center);
          wrapper.add(model);

          const hitboxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
          const hitboxMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
          });
          const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
          hitbox.name = "hitbox";
          wrapper.add(hitbox);

          wrapper.traverse((child) => {
            if (child.isMesh) {
              if (child.name !== "hitbox") {
                child.castShadow = true;
                child.receiveShadow = true;
              } else {
                child.castShadow = false;
                child.receiveShadow = false;
              }
            }
          });

          setupMesh(wrapper);
        } catch (e) {
          console.error("normalizeAndSetup error:", e);
          setupMesh(this._createBoxItem(item.color || 0x2196f3));
        }
      };

      const modelUrl =
        item.presignedModel3dUrl ||
        (typeof item.preloadedModel === "string" && item.preloadedModel) ||
        item.modelUrl ||
        item.imageUrl;

      try {
        if (item.preloadedModel && typeof item.preloadedModel !== "string") {
          normalizeAndSetup(item.preloadedModel);
        } else if (modelUrl && !modelUrl.match(/\.(png|jpg|jpeg|webp)$/i)) {
          if (!gltfPromiseCache[modelUrl]) {
            const loader = new GLTFLoader();
            gltfPromiseCache[modelUrl] = new Promise((resolve, reject) => {
              loader.load(
                modelUrl,
                (gltf) => resolve(gltf.scene),
                undefined,
                reject,
              );
            });
          }
          const model = await gltfPromiseCache[modelUrl];
          normalizeAndSetup(model);
        } else {
          let mesh;
          switch (item.id) {
            case "plastic_bottle":
              mesh = this._createBottle(item.color || 0xffffff);
              break;
            case "can":
              mesh = this._createCan(item.color || 0xffffff);
              break;
            default:
              mesh = this._createBoxItem(item.color || 0xffffff);
              break;
          }
          setupMesh(mesh);
        }
      } catch (err) {
        console.error("Sorter Load Error:", err);
        setupMesh(this._createBoxItem(item.color || 0x2196f3));
      } finally {
        loadedCount++;
        if (onProgress) onProgress(loadedCount / items.length);
      }
    };

    // Parallel setup
    await Promise.all(items.map((item, idx) => setupItem(item, idx)));
  }

  _createBottle(color) {
    const group = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.7, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    const capGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.1, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.3;
    group.add(cap);

    return group;
  }

  _createCan(color) {
    const geo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12);
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.6,
      roughness: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  _createBoxItem(color) {
    const geo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  _setupCamera() {
    // Adjust FOV based on aspect ratio to prevent clipping on wide screens
    const aspect = window.innerWidth / window.innerHeight;
    // Wider screens need a wider FOV to see all bins + scenery
    const baseFov = 60;
    const targetFov = aspect > 1.6 ? baseFov + (aspect - 1.6) * 12 : baseFov;
    this.camera.fov = Math.min(targetFov, 85);
    this.camera.updateProjectionMatrix();

    // Pull camera back further on wide aspect ratios
    const camZ = aspect > 1.6 ? 7 + (aspect - 1.6) * 2 : 7;
    const camY = aspect > 1.6 ? 7 + (aspect - 1.6) * 1.5 : 7;

    gsap.to(this.camera.position, {
      x: 0,
      y: camY,
      z: camZ,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(this.camera.rotation, {
      x: -Math.PI / 4,
      y: 0,
      z: 0,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  // ─── Event Handling ─────────────────────────────────────────────────────────

  _addEventListeners() {
    const domElement = this.renderer.domElement;
    // Prevent touch scrolling / long-press context menu on mobile
    domElement.style.touchAction = "none";
    domElement.style.userSelect = "none";
    domElement.style.webkitUserSelect = "none";
    domElement.addEventListener("pointerdown", this._onPointerDown);
    domElement.addEventListener("pointermove", this._onPointerMove);
    domElement.addEventListener("pointerup", this._onPointerUp);
    domElement.addEventListener("pointercancel", this._onPointerUp);
    domElement.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("resize", this._onResize);
  }

  _removeEventListeners() {
    const domElement = this.renderer.domElement;
    if (domElement) {
      domElement.removeEventListener("pointerdown", this._onPointerDown);
      domElement.removeEventListener("pointermove", this._onPointerMove);
      domElement.removeEventListener("pointerup", this._onPointerUp);
      domElement.removeEventListener("pointercancel", this._onPointerUp);
    }
    window.removeEventListener("resize", this._onResize);
  }

  _onResize() {
    if (this.renderer.domElement) {
      this.domRect = this.renderer.domElement.getBoundingClientRect();
    }
    // Re-adjust camera for new aspect ratio
    const aspect = window.innerWidth / window.innerHeight;
    const baseFov = 60;
    const targetFov = aspect > 1.6 ? baseFov + (aspect - 1.6) * 12 : baseFov;
    this.camera.fov = Math.min(targetFov, 85);
    this.camera.updateProjectionMatrix();

    const camZ = aspect > 1.6 ? 7 + (aspect - 1.6) * 2 : 7;
    const camY = aspect > 1.6 ? 7 + (aspect - 1.6) * 1.5 : 7;
    this.camera.position.set(0, camY, camZ);
  }

  _getPointerPosition(event) {
    if (!this.domRect) this._onResize();
    const rect = this.domRect;
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _onPointerDown(event) {
    event.preventDefault();
    this._getPointerPosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Get all sortable meshes and their children
    const sortableMeshes = [];
    this.trashMeshes.forEach((mesh) => {
      if (mesh.userData.type === "sortable") {
        sortableMeshes.push(mesh);
        // Also check children for groups
        mesh.traverse((child) => {
          if (child.isMesh) sortableMeshes.push(child);
        });
      }
    });

    const intersects = this.raycaster.intersectObjects(sortableMeshes, true);

    if (intersects.length > 0) {
      // Find the top-level sortable parent
      let target = intersects[0].object;
      while (target.parent && target.userData.type !== "sortable") {
        target = target.parent;
      }

      if (target.userData.type === "sortable") {
        this.selectedObject = target;
        this.isDragging = true;
        this.originalPosition.copy(target.userData.originalPos);
        const baseScale = target.userData.baseScale;

        // Capture pointer to keep receiving events even if pointer leaves canvas
        this.renderer.domElement.setPointerCapture(event.pointerId);

        // Lift animation
        gsap.to(target.position, {
          y: ITEM_Y + 0.8,
          duration: 0.2,
          ease: "power2.out",
        });
        gsap.to(target.scale, {
          x: baseScale.x * 1.2,
          y: baseScale.y * 1.2,
          z: baseScale.z * 1.2,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    }
  }

  _onPointerMove(event) {
    if (!this.isDragging || !this.selectedObject) return;
    event.preventDefault();

    this._getPointerPosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersection = new THREE.Vector3();
    const result = this.raycaster.ray.intersectPlane(
      this.dragPlane,
      intersection,
    );

    if (result) {
      this.selectedObject.position.x = intersection.x;
      this.selectedObject.position.z = intersection.z;
    }
  }

  _onPointerUp(event) {
    if (!this.isDragging || !this.selectedObject) {
      // Release capture even if not dragging
      try { this.renderer.domElement.releasePointerCapture(event.pointerId); } catch (e) { }
      return;
    }

    this.isDragging = false;
    const droppedItem = this.selectedObject;
    this.selectedObject = null;

    // Release pointer capture
    try { this.renderer.domElement.releasePointerCapture(event.pointerId); } catch (e) { }

    // Check if dropped on a bin
    const itemPos = droppedItem.position;
    let droppedOnBin = null;

    for (const bin of this.binMeshes) {
      const dx = itemPos.x - bin.position.x;
      const dz = itemPos.z - bin.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Increased hitbox for mobile: 2.0 instead of 1.2
      if (distance < 2.0) {
        droppedOnBin = bin;
        break;
      }
    }

    if (droppedOnBin) {
      const correctBin = droppedItem.userData.correctBin;
      const binId = droppedOnBin.userData.binId;

      if (correctBin === binId) {
        // Correct!
        this.score.correct++;
        this._handleCorrectSort(droppedItem, droppedOnBin);
      } else {
        // Wrong!
        this.score.wrong++;
        if (this.config.penaltyOnWrong && this.score.correct > 0) {
          this.score.correct--; // Penalty: subtract a correct point
        }
        this._handleWrongSort(droppedItem);
      }
    } else {
      // Dropped outside any bin — return to original position
      this._returnToOriginal(droppedItem);
    }

    // Update HUD
    if (this._onScoreUpdate) {
      this._onScoreUpdate(this.score, this.itemsRemaining);
    }
  }

  _handleCorrectSort(item, bin) {
    this.itemsRemaining--;

    // Play correct sound
    this._playSfx(this.correctSound);

    // Success animation: fly into bin and shrink
    const tl = gsap.timeline({
      onComplete: () => {
        this.scene.remove(item);
        const idx = this.trashMeshes.indexOf(item);
        if (idx > -1) this.trashMeshes.splice(idx, 1);

        // Check if all items sorted
        if (this.itemsRemaining <= 0) {
          this._handleAllSorted();
        }
      },
    });

    tl.to(item.position, {
      x: bin.position.x,
      y: bin.position.y + 1.5,
      z: bin.position.z,
      duration: 0.3,
      ease: "power2.in",
    });
    tl.to(
      item.scale,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "-=0.1",
    );

    // Bin pulse effect
    gsap.to(bin.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    });
  }

  _handleWrongSort(item) {
    // Play wrong sound
    this._playSfx(this.wrongSound);

    // Shake animation + return to original position
    const tl = gsap.timeline();

    // Red flash (temporarily change color)
    tl.to(item.position, {
      x: "+=0.2",
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: "none",
    });

    tl.to(item.position, {
      x: item.userData.originalPos.x,
      y: ITEM_Y,
      z: item.userData.originalPos.z,
      duration: 0.4,
      ease: "back.out(1.7)",
    });

    const baseScale = item.userData.baseScale;
    tl.to(
      item.scale,
      {
        x: baseScale.x,
        y: baseScale.y,
        z: baseScale.z,
        duration: 0.3,
        ease: "power2.out",
      },
      "<",
    );
  }

  _returnToOriginal(item) {
    gsap.to(item.position, {
      x: item.userData.originalPos.x,
      y: ITEM_Y,
      z: item.userData.originalPos.z,
      duration: 0.4,
      ease: "back.out(1.7)",
    });

    const baseScale = item.userData.baseScale;
    gsap.to(item.scale, {
      x: baseScale.x,
      y: baseScale.y,
      z: baseScale.z,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  _handleAllSorted() {
    this.stateManager.sortingScore = { ...this.score };

    setTimeout(() => {
      if (this._onStageComplete) {
        this._onStageComplete(this.score);
      }
    }, 800);
  }

  // ─── Callbacks ──────────────────────────────────────────────────────────────

  onScoreUpdate(callback) {
    this._onScoreUpdate = callback;
  }

  onStageComplete(callback) {
    this._onStageComplete = callback;
  }

  onTimerUpdate(callback) {
    this._onTimerUpdate = callback;
  }

  // ─── Update (timer + idle animations) ──────────────────────────────────────

  update(delta) {
    // Gentle rotation for idle items
    this.trashMeshes.forEach((mesh) => {
      if (mesh !== this.selectedObject) {
        mesh.rotation.y += delta * 0.5;
      }
    });
  }

  pause() {
    if (this._isPaused) return;
    this._isPaused = true;
    this._pauseStartTime = Date.now();
  }

  resume() {
    if (!this._isPaused) return;
    this._isPaused = false;
    this._accumulatedPausedTime += Date.now() - this._pauseStartTime;
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  dispose() {
    this._removeEventListeners();
    if (this._timerId) clearInterval(this._timerId);

    const toRemove = [
      ...this.trashMeshes,
      ...this.binMeshes,
      this._table,
      ...this._tableLegs,
      this._floor,
      this._ambientLight,
      this._dirLight,
    ].filter(Boolean);

    toRemove.forEach((obj) => {
      this.scene.remove(obj);
      obj.traverse?.((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });

    // Cleanup Audio
    if (this.correctSound?.isPlaying) this.correctSound.stop();
    if (this.wrongSound?.isPlaying) this.wrongSound.stop();
    this.correctSound = null;
    this.wrongSound = null;

    this.trashMeshes = [];
    this.binMeshes = [];
    this._tableLegs = [];
  }
}
