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
  BinType,
  SPAWNABLE_TRASH,
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

    // Timer support (configurable)
    this.timeRemaining = this.config.timeLimit; // 0 = no limit
    this.timerActive = this.config.timeLimit > 0;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onResize = this._onResize.bind(this);

    this.domRect = null;
  }

  // ─── Initialization ─────────────────────────────────────────────────────────

  init() {
    this._clearScene();
    this._createEnvironment();
    this._createTable();
    this._createBins();
    this._createTrashItems();
    this._setupCamera();
    this._addEventListeners();
    this._onResize(); // Initial rect cache
  }

  _clearScene() {
    // Remove runner stage objects (the scene is shared)
    // The EcoGame orchestrator handles this
  }

  _createEnvironment() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);
    this._ambientLight = ambient;

    // Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);
    this._dirLight = dirLight;

    // Background
    this.scene.background = new THREE.Color(0xe8f5e9);
    this.scene.fog = null;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xc8e6c9,
      roughness: 0.9,
    });
    this._floor = new THREE.Mesh(floorGeo, floorMat);
    this._floor.rotation.x = -Math.PI / 2;
    this._floor.position.y = -0.7;
    this._floor.receiveShadow = true;
    this.scene.add(this._floor);
  }

  _createTable() {
    // Table surface
    const tableGeo = new THREE.BoxGeometry(
      TABLE_SIZE.w,
      TABLE_SIZE.h,
      TABLE_SIZE.d,
    );
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xd1d1d1,
      roughness: 0.7,
    });
    this._table = new THREE.Mesh(tableGeo, tableMat);
    this._table.position.set(0, TABLE_Y, 1);
    this._table.receiveShadow = true;
    this._table.castShadow = true;
    this.scene.add(this._table);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41 });
    const legPositions = [
      [-TABLE_SIZE.w / 2 + 0.3, -0.45, 1 + TABLE_SIZE.d / 2 - 0.3],
      [TABLE_SIZE.w / 2 - 0.3, -0.45, 1 + TABLE_SIZE.d / 2 - 0.3],
      [-TABLE_SIZE.w / 2 + 0.3, -0.45, 1 - TABLE_SIZE.d / 2 + 0.3],
      [TABLE_SIZE.w / 2 - 0.3, -0.45, 1 - TABLE_SIZE.d / 2 + 0.3],
    ];
    this._tableLegs = [];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      this.scene.add(leg);
      this._tableLegs.push(leg);
    });
  }

  _createBins() {
    const numBins = this.wasteCategories.length;
    const totalWidth = 14; // Spread bins across this width
    let spacing, startX;

    if (numBins === 1) {
      startX = 0;
      spacing = 0;
    } else {
      spacing = totalWidth / (numBins - 1);
      startX = -totalWidth / 2;
    }

    this.wasteCategories.forEach((catCode, index) => {
      const binType = DynamicBinTypes[catCode] || DynamicBinTypes.GENERAL;
      
      // Responsive bin layout: use a narrower spread if the screen is portrait
      const aspect = window.innerWidth / window.innerHeight;
      const responsiveWidth = aspect < 1 ? 6 : 14; 
      const responsiveSpacing = numBins === 1 ? 0 : responsiveWidth / (numBins - 1);
      const responsiveStartX = -responsiveWidth / 2;
      
      const x = responsiveStartX + responsiveSpacing * index;
      const z = -4;

      const group = new THREE.Group();

      // Bin body
      const binGeo = new THREE.CylinderGeometry(1.0, 0.85, 2.0, 16, 1, true);
      const binMat = new THREE.MeshStandardMaterial({
        color: binType.color,
        side: THREE.DoubleSide,
        roughness: 0.5,
        metalness: 0.2,
      });
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.castShadow = true;
      group.add(bin);

      // Bin bottom
      const bottomGeo = new THREE.CircleGeometry(0.85, 16);
      const bottomMat = new THREE.MeshStandardMaterial({
        color: binType.color,
      });
      const bottom = new THREE.Mesh(bottomGeo, bottomMat);
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = -1.0;
      group.add(bottom);

      // Bin rim
      const rimGeo = new THREE.TorusGeometry(1.0, 0.06, 8, 32);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.5,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 1.0;
      group.add(rim);

      // Label using a small plane with canvas texture
      const label = this._createBinLabel(binType.name, binType.color);
      label.position.set(0, 0, 1.05);
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
        duration: 0.5,
        ease: "back.out(1.7)",
        delay: 0.3,
      });
    });
  }

  _createBinLabel(text, bgColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.roundRect(8, 8, 496, 176, 24);
    ctx.fill();

    // Text
    ctx.fillStyle = "#333333";
    ctx.font = "bold 64px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 96);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const geo = new THREE.PlaneGeometry(1.6, 0.6);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    return new THREE.Mesh(geo, mat);
  }

  _createTrashItems() {
    const items = this.stateManager.getTrashItemsForSorting();

    this.itemsRemaining = items.length;

    // Arrange items on the table in a grid
    const cols = Math.ceil(Math.sqrt(items.length));
    const spacing = TABLE_SIZE.w / (cols + 1);

    // Dùng cache để tránh XHR dồn dập khiến 1 vài file GLTF bị browser drop ngầm
    const gltfPromiseCache = {};

    items.forEach((item, index) => {
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

        // Entrance animation
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
          if (maxDim > 0) model.scale.multiplyScalar(0.6 / maxDim); // Scaled up from 0.4

          const box2 = new THREE.Box3().setFromObject(model);
          const center = box2.getCenter(new THREE.Vector3());
          model.position.sub(center);

          wrapper.add(model);

          // Add invisible hitbox for easier picking
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
              // Only allow actual models to cast/receive shadows, not the invisible hitbox
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
        item.model3dPresignedUrl ||
        (typeof item.preloadedModel === "string" && item.preloadedModel) ||
        item.modelUrl ||
        item.imageUrl;

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

        gltfPromiseCache[modelUrl]
          .then((model) => normalizeAndSetup(model))
          .catch((err) => {
            console.error("Sorter GLTF Load Error:", err);
            setupMesh(this._createBoxItem(item.color || 0x2196f3));
          });
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
    });
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
    gsap.to(this.camera.position, {
      x: 0,
      y: 7,
      z: 7,
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
    domElement.addEventListener("pointerdown", this._onPointerDown);
    domElement.addEventListener("pointermove", this._onPointerMove);
    domElement.addEventListener("pointerup", this._onPointerUp);
    window.addEventListener("resize", this._onResize);
  }

  _removeEventListeners() {
    const domElement = this.renderer.domElement;
    domElement.removeEventListener("pointerdown", this._onPointerDown);
    domElement.removeEventListener("pointermove", this._onPointerMove);
    domElement.removeEventListener("pointerup", this._onPointerUp);
    window.removeEventListener("resize", this._onResize);
  }

  _onResize() {
    if (this.renderer.domElement) {
      this.domRect = this.renderer.domElement.getBoundingClientRect();
    }
  }

  _getPointerPosition(event) {
    if (!this.domRect) this._onResize();
    const rect = this.domRect;
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _onPointerDown(event) {
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

    this._getPointerPosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersection = new THREE.Vector3();
    const result = this.raycaster.ray.intersectPlane(this.dragPlane, intersection);
 
    if (result) {
      this.selectedObject.position.x = intersection.x;
      this.selectedObject.position.z = intersection.z;
    }
  }

  _onPointerUp(event) {
    if (!this.isDragging || !this.selectedObject) return;

    this.isDragging = false;
    const droppedItem = this.selectedObject;
    this.selectedObject = null;

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
    // Timer countdown (configurable)
    if (this.timerActive && this.timeRemaining > 0) {
      this.timeRemaining -= delta;
      if (this._onTimerUpdate) {
        this._onTimerUpdate(Math.max(0, this.timeRemaining));
      }
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.timerActive = false;
        // Time's up — trigger completion with current score
        this._handleAllSorted();
        return;
      }
    }

    // Gentle rotation for idle items
    this.trashMeshes.forEach((mesh) => {
      if (mesh !== this.selectedObject) {
        mesh.rotation.y += delta * 0.5;
      }
    });
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  dispose() {
    this._removeEventListeners();

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

    this.trashMeshes = [];
    this.binMeshes = [];
    this._tableLegs = [];
  }
}
