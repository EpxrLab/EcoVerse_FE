/**
 * EcoGrabber - Stage 1: Crane Grabber Game (Cần Cẩu Sinh Thái)
 *
 * Isometric 3D crane game where the player rotates a crane arm 360°,
 * clicks to stop, clicks again to extend the claw downward, and grabs
 * trash from an underwater scene. Marine life must be avoided.
 *
 * Uses the same interface as EcoGameRunner / EcoSeaRescue:
 *   init(onProgress), update(delta), dispose(),
 *   onTrashCollected(cb), onDistanceUpdate(cb), onStageComplete(cb)
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

// ─── Constants ────────────────────────────────────────────────────────────────

const WATER_DEPTH = -12;
const CRANE_BASE_Y = 6;
const CRANE_ARM_LENGTH = 14;
const CLAW_OPEN_ANGLE = 0.4; // radians
const CLAW_CLOSED_ANGLE = 0.05;

// Grab states
const GrabState = {
    MANUAL: "MANUAL",
    DESCENDING: "DESCENDING",
    GRABBING: "GRABBING",
    ASCENDING: "ASCENDING",
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

// ─── Main Class ───────────────────────────────────────────────────────────────

export default class EcoGrabber {
    /**
     * @param {THREE.Scene} scene
     * @param {THREE.Camera} camera
     * @param {EcoGameStateManager} stateManager
     * @param {object} config - grabber sub-object of level config
     * @param {Array} wasteItems - Preloaded waste items from API (may be empty)
     */
    constructor(scene, camera, stateManager, config = {}, wasteItems = []) {
        this.scene = scene;
        this.camera = camera;
        this.stateManager = stateManager;
        this.wasteItems = wasteItems;

        // Config with defaults
        this.config = {
            gameTime: config.gameTime ?? 90,
            rotationSpeed: config.rotationSpeed ?? 2.2, // Increased from 1.2
            descentSpeed: config.descentSpeed ?? 12,    // Increased from 5
            ascentSpeed: config.ascentSpeed ?? 10,     // Increased from 4
            totalTrash: config.totalTrash ?? 10,
            requiredPercentage: config.requiredPercentage ?? 60,
            penaltyTime: config.penaltyTime ?? 5,
        };

        // State
        this.grabState = GrabState.MANUAL;
        this.keys = {}; // Track keyboard input
        this.craneAngle = 0;
        this.clawY = CRANE_BASE_Y - 1;
        this.clawTargetY = this.clawY;
        this.timeLeft = this.config.gameTime;
        this.score = 0;
        this.trashCollected = 0;
        this.isGameOver = false;
        this.grabbedObject = null;
        this.isPenalty = false;

        // Reach state
        this.reachRatio = 0.5; // 0 (near) to 1 (far)
        this.reachDir = 1;
        this.maxReach = CRANE_ARM_LENGTH - 1;
        this.minReach = 1.5;
        this.currentReach = this.minReach + (this.maxReach - this.minReach) * this.reachRatio;

        // Mobile / Joystick state
        this.joystick = { x: 0, y: 0 };

        // 3D groups
        this.craneGroup = null;
        this.armGroup = null;
        this.cableGroup = null;
        this.clawGroup = null;
        this.clawProngs = [];
        this.trashObjects = [];
        this.rocks = [];
        this.marineLife = [];
        this.coralObjects = [];
        this.bubbleParticles = [];
        this.waterPlane = null;
        this._modelCache = new Map(); // Store GLB models from API
        this.seaFloor = null;
        this.targetShadow = null;
        this.rockModel = null;
        this.anemoneModels = [];
        this.clownFishModels = [];
        this.fishAnimatedModels = [];
        this.turtleModels = [];

        // VFX state
        this.waterClarity = 0; // 0=dirty, 1=clean
        this.fishCount = 3;
        this.coralBloom = 0;

        // Callbacks (same interface as Runner/SeaRescue)
        this._cbTrashCollected = [];
        this._cbDistanceUpdate = [];
        this._cbStageComplete = [];
        this._cbTimerUpdate = [];
        this._cbInstructionUpdate = [];

        // Audio
        this.audioListener = null;
        this.sounds = {};

        // Bound handlers
        this._onClick = this._handleClick.bind(this);
        this._onTouch = this._handleTouch.bind(this);
        this._onResize = this._handleResize.bind(this);
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    async init(onProgress = null) {
        if (onProgress) onProgress(5);

        // Setup camera (isometric-like perspective)
        this._setupCamera();
        if (onProgress) onProgress(10);

        // 1. Load Models First (Ensure assets are ready for environment creation)
        await this._loadEnvironmentModels();
        await this._loadTrashModels(onProgress);
        if (onProgress) onProgress(40);

        // 2. Create environment
        this._createLighting();
        this._createWater();
        this._createSeaFloor(); // Now can use this.rockModel
        this._createCoral();
        this._createCrane();
        if (onProgress) onProgress(70);

        // 3. Spawn objects
        this._spawnTrash();
        this._spawnMarineLife();
        if (onProgress) onProgress(90);

        // Audio
        this._loadAudio();
        if (onProgress) onProgress(95);

        // Event listeners
        this._addEventListeners();
        if (onProgress) onProgress(100);
    }

    // ─── Camera ───────────────────────────────────────────────────────────────

    _setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // Adjust FOV for mobile portrait to see more vertical space
        const baseFov = 50;
        this.camera.fov = aspect < 1 ? baseFov + 15 : baseFov;
        
        // Pull camera back a bit more on mobile
        const camDist = aspect < 1 ? 24 : 18;
        this.camera.position.set(camDist, camDist * 0.88, camDist);
        
        this.camera.lookAt(0, -2, 0);
        this.camera.updateProjectionMatrix();
    }

    // ─── Lighting ─────────────────────────────────────────────────────────────

    _createLighting() {
        // Remove existing lights
        const toRemove = [];
        this.scene.traverse((child) => {
            if (child.isLight) toRemove.push(child);
        });
        toRemove.forEach((l) => this.scene.remove(l));

        // Ambient
        const ambient = new THREE.AmbientLight(0x88bbdd, 0.6);
        this.scene.add(ambient);

        // Directional (sun)
        const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
        sun.position.set(10, 20, 8);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        this.scene.add(sun);

        // Hemisphere for underwater feel
        const hemi = new THREE.HemisphereLight(0x87ceeb, 0x2e5a3a, 0.4);
        this.scene.add(hemi);

        // Fog — starts murky, clears as trash is removed
        this.scene.fog = new THREE.FogExp2(0x3a7ca5, 0.008);
        this.scene.background = new THREE.Color(0x87ceeb);
    }

    // ─── Water Surface ────────────────────────────────────────────────────────

    _createWater() {
        const waterGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
        const waterMat = new THREE.MeshPhysicalMaterial({
            color: 0x3a8fb7,
            transparent: true,
            opacity: 0.55,
            roughness: 0.1,
            metalness: 0.1,
            side: THREE.DoubleSide,
        });
        this.waterPlane = new THREE.Mesh(waterGeo, waterMat);
        this.waterPlane.rotation.x = -Math.PI / 2;
        this.waterPlane.position.y = 0;
        this.waterPlane.receiveShadow = true;
        this.scene.add(this.waterPlane);

        // Animated water vertices
        this._waterVertices = waterGeo.attributes.position.array.slice();
    }

    // ─── Sea Floor ────────────────────────────────────────────────────────────

    _createSeaFloor() {
        const floorGeo = new THREE.PlaneGeometry(60, 60, 16, 16);
        // Add some height variation
        const pos = floorGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.setZ(i, randRange(-0.5, 0.5));
        }
        floorGeo.computeVertexNormals();

        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x8b7d6b,
            roughness: 0.9,
            flatShading: true,
        });
        this.seaFloor = new THREE.Mesh(floorGeo, floorMat);
        this.seaFloor.rotation.x = -Math.PI / 2;
        this.seaFloor.position.y = WATER_DEPTH;
        this.seaFloor.receiveShadow = true;
        this.scene.add(this.seaFloor);

        // Rocks
        const usedRockPositions = [];
        for (let i = 0; i < 12; i++) {
            let rock;
            if (this.rockModel) {
                const wrapper = new THREE.Group();
                const model = this.rockModel.clone(true);

                // Align model bottom to wrapper pivot
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                model.position.set(-center.x, -(center.y - size.y / 2), -center.z);
                wrapper.add(model);

                rock = wrapper;
                // Make some rocks much larger (up to 3x-4x)
                const baseScale = i < 3 ? randRange(2.5, 4.0) : randRange(0.8, 2.0);
                rock.scale.setScalar(baseScale);
            } else {
                // Fallback to procedural if model fails
                const rockGeo = new THREE.DodecahedronGeometry(randRange(0.5, 1.5), 0);
                const rockMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(0.08, 0.15, randRange(0.3, 0.5)),
                    flatShading: true,
                    roughness: 0.85,
                });
                rock = new THREE.Mesh(rockGeo, rockMat);
                if (i < 3) rock.scale.multiplyScalar(2.5);
            }

            // Spawn xung quanh cần cẩu (360 degrees)
            let x, z, pos;
            let attempts = 0;
            const minSpace = rock.scale.x > 2 ? 6.0 : 3.5;

            do {
                const angle = randRange(0, Math.PI * 2);
                const dist = randRange(this.minReach + 1, this.maxReach + 3);
                x = Math.cos(angle) * dist;
                z = Math.sin(angle) * dist;
                pos = new THREE.Vector2(x, z);
                attempts++;
            } while (
                attempts < 30 &&
                usedRockPositions.some(p => p.distanceTo(pos) < minSpace)
            );
            usedRockPositions.push(pos);

            rock.position.set(
                x,
                WATER_DEPTH + randRange(1.5, 2.5), // Further increased height to ensure it's fully above bumps
                z
            );
            rock.rotation.set(
                randRange(0, Math.PI),
                randRange(0, Math.PI),
                randRange(0, Math.PI),
            );
            if (!this.rockModel) rock.scale.y *= randRange(0.5, 1);
            rock.castShadow = true;
            rock.userData = {
                type: "rock",
                weight: i < 3 ? 15 : 8, // Larger rocks are heavier
                grabbed: false,
                name: i < 3 ? "Tảng đá lớn" : "Cục đá",
            };
            this.rocks.push(rock);
            this.scene.add(rock);
        }
    }

    // ─── Coral ────────────────────────────────────────────────────────────────

    _createCoral() {
        for (let i = 0; i < 12; i++) {
            let coralGroup;

            if (this.anemoneModels && this.anemoneModels.length > i) {
                coralGroup = new THREE.Group();
                const model = this.anemoneModels[i];

                // Align model bottom to wrapper pivot
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                model.position.set(-center.x, -(center.y - size.y / 2), -center.z);

                coralGroup.add(model);
            } else {
                coralGroup = new THREE.Group();
                const coralColors = [0xff6b6b, 0xff9ff3, 0xfeca57, 0x48dbfb, 0xff6348];
                const color =
                    coralColors[Math.floor(Math.random() * coralColors.length)];

                // Main branch
                const branchGeo = new THREE.CylinderGeometry(0.08, 0.2, randRange(1, 2.5), 6);
                const branchMat = new THREE.MeshStandardMaterial({
                    color,
                    flatShading: true,
                    roughness: 0.7,
                });
                const branch = new THREE.Mesh(branchGeo, branchMat);
                branch.position.y = branchGeo.parameters.height / 2;
                coralGroup.add(branch);

                // Top bulb (coral head)
                const bulbGeo = new THREE.SphereGeometry(
                    randRange(0.3, 0.6),
                    6,
                    6,
                );
                const bulb = new THREE.Mesh(bulbGeo, branchMat);
                bulb.position.y = branchGeo.parameters.height + 0.2;
                coralGroup.add(bulb);

                // Sub-branches
                const subCount = Math.floor(randRange(1, 4));
                for (let j = 0; j < subCount; j++) {
                    const subGeo = new THREE.CylinderGeometry(0.04, 0.1, randRange(0.5, 1.2), 5);
                    const sub = new THREE.Mesh(subGeo, branchMat);
                    const angle = (j / subCount) * Math.PI * 2;
                    sub.position.set(
                        Math.cos(angle) * 0.3,
                        randRange(0.3, 1),
                        Math.sin(angle) * 0.3,
                    );
                    sub.rotation.z = randRange(-0.5, 0.5);
                    coralGroup.add(sub);
                }
            }

            let x, z;
            if (i < 4) {
                // Giữa map (gần gốc cần cẩu)
                const angle = randRange(0, Math.PI * 2);
                const dist = randRange(0.5, 3.0);
                x = Math.cos(angle) * dist;
                z = Math.sin(angle) * dist;
            } else {
                // Ngoài rìa map (xa tầm gắp)
                const angle = randRange(0, Math.PI * 2);
                const dist = randRange(14, 18);
                x = Math.cos(angle) * dist;
                z = Math.sin(angle) * dist;
            }

            coralGroup.position.set(x, WATER_DEPTH, z);
            coralGroup.rotation.y = randRange(0, Math.PI * 2);

            // Start small, will bloom as trash is cleared
            coralGroup.scale.setScalar(0.5);
            coralGroup.userData.baseScale = 0.5;
            coralGroup.userData.maxScale = 1.0 + Math.random() * 0.5;

            this.coralObjects.push(coralGroup);
            this.scene.add(coralGroup);
        }
    }

    // ─── Crane ────────────────────────────────────────────────────────────────

    _createCrane() {
        this.craneGroup = new THREE.Group();

        // ── Base platform (dock) ──
        const dockGeo = new THREE.BoxGeometry(5, 1, 5);
        const dockMat = new THREE.MeshStandardMaterial({
            color: 0x78909c,
            roughness: 0.6,
            flatShading: true,
        });
        const dock = new THREE.Mesh(dockGeo, dockMat);
        dock.position.y = CRANE_BASE_Y - 0.5;
        dock.castShadow = true;
        this.craneGroup.add(dock);

        // ── Tower ──
        const towerGeo = new THREE.CylinderGeometry(0.4, 0.6, 4, 8);
        const towerMat = new THREE.MeshStandardMaterial({
            color: 0xfdd835,
            roughness: 0.4,
            flatShading: true,
        });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = CRANE_BASE_Y + 2;
        tower.castShadow = true;
        this.craneGroup.add(tower);

        // ── Rotating arm group ──
        this.armGroup = new THREE.Group();
        this.armGroup.position.y = CRANE_BASE_Y + 4;

        // Horizontal arm
        const armGeo = new THREE.BoxGeometry(CRANE_ARM_LENGTH, 0.4, 0.4);
        const armMat = new THREE.MeshStandardMaterial({
            color: 0x66bb6a,
            roughness: 0.4,
            flatShading: true,
        });
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.position.x = CRANE_ARM_LENGTH / 2 - 1;
        arm.castShadow = true;
        this.armGroup.add(arm);

        // ── Cable + Claw group ──
        this.cableGroup = new THREE.Group();
        this.cableGroup.position.x = CRANE_ARM_LENGTH - 1;

        // Cable (thin cylinder)
        const cableGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 4);
        const cableMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        this.cable = new THREE.Mesh(cableGeo, cableMat);
        this.cable.position.y = -0.5;
        this.cableGroup.add(this.cable);

        // Claw group
        this.clawGroup = new THREE.Group();
        this.clawGroup.position.y = -1;

        // Claw hub
        const hubGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8);
        const hubMat = new THREE.MeshStandardMaterial({
            color: 0xfdd835,
            flatShading: true,
        });
        const hub = new THREE.Mesh(hubGeo, hubMat);
        this.clawGroup.add(hub);

        // 3 prongs
        for (let i = 0; i < 3; i++) {
            const prongGeo = new THREE.ConeGeometry(0.08, 0.8, 4);
            const prongMat = new THREE.MeshStandardMaterial({
                color: 0xffa726,
                flatShading: true,
            });
            const prong = new THREE.Mesh(prongGeo, prongMat);
            const angle = (i / 3) * Math.PI * 2;
            prong.position.set(
                Math.cos(angle) * 0.2,
                -0.4,
                Math.sin(angle) * 0.2,
            );
            prong.userData.baseAngle = angle;
            prong.userData.openAngle = CLAW_OPEN_ANGLE;
            this.clawProngs.push(prong);
            this.clawGroup.add(prong);
        }
        this._setClawOpen(true);

        this.cableGroup.add(this.clawGroup);
        this.armGroup.add(this.cableGroup);
        this.craneGroup.add(this.armGroup);
        this.scene.add(this.craneGroup);

        // ── Target Shadow (on seafloor) ──
        const shadowGeo = new THREE.CircleGeometry(0.5, 16);
        const shadowMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            depthWrite: false, // Don't obscure floor
        });
        this.targetShadow = new THREE.Mesh(shadowGeo, shadowMat);
        this.targetShadow.rotation.x = -Math.PI / 2;
        this.targetShadow.position.y = WATER_DEPTH + 0.05; // Slightly above floor
        this.scene.add(this.targetShadow);

        // Initial claw Y position in world space
        this.clawY = CRANE_BASE_Y + 3;
    }

    _setClawOpen(open) {
        const targetAngle = open ? CLAW_OPEN_ANGLE : CLAW_CLOSED_ANGLE;
        this.clawProngs.forEach((prong) => {
            const angle = prong.userData.baseAngle;
            gsap.to(prong.rotation, {
                x: open ? targetAngle : -targetAngle * 0.5,
                z: open
                    ? Math.sin(angle) * targetAngle
                    : Math.sin(angle) * targetAngle * 0.2,
                duration: 0.3,
                ease: "power2.out",
            });
            gsap.to(prong.position, {
                x: Math.cos(angle) * (open ? 0.3 : 0.1),
                z: Math.sin(angle) * (open ? 0.3 : 0.1),
                duration: 0.3,
                ease: "power2.out",
            });
        });
    }

    // ─── Trash Spawning ───────────────────────────────────────────────────────

    _spawnTrash() {
        const count = this.config.totalTrash;
        const usedPositions = [];
        const validApiItems = this.wasteItems ? this.wasteItems.filter(
            (w) => w.presignedModel3dUrl || w.imagePresignedUrl || w.preloadedModel
        ) : [];
        const hasApiItems = validApiItems.length > 0;

        for (let i = 0; i < count; i++) {
            let mesh;
            let def;

            if (hasApiItems) {
                const apiItem = validApiItems[i % validApiItems.length];
                const itemId = apiItem.wasteItemId || apiItem.id;
                const cachedModel = this._modelCache.get(itemId);

                if (cachedModel) {
                    const wrapper = new THREE.Group();
                    const model = cachedModel.clone(true);

                    // Normalize and scale
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);

                    const targetScale = 2.8 / maxDim;
                    model.scale.setScalar(targetScale);

                    // Align model bottom to wrapper pivot
                    model.position.set(
                        -center.x * targetScale,
                        -(center.y - size.y / 2) * targetScale,
                        -center.z * targetScale
                    );
                    wrapper.add(model);
                    mesh = wrapper;

                    mesh.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            if (child.material) {
                                child.material = child.material.clone();
                                child.material.emissive = new THREE.Color(0x444444);
                                child.material.emissiveIntensity = 0.3;
                            }
                        }
                    });

                    // Map API fields to game def
                    const cat = (apiItem.wasteCategory || "GENERAL").toUpperCase();
                    const binMap = {
                        RECYCLABLE: "recyclable", PLASTIC: "recyclable", PAPER: "recyclable", METAL: "recyclable",
                        ORGANIC: "organic", HAZARDOUS: "hazardous", GENERAL: "general", OTHER: "general"
                    };
                    def = {
                        ...apiItem,
                        id: itemId,
                        name: apiItem.itemName || apiItem.name,
                        bin: binMap[cat] || "general",
                        weight: randRange(1, 3),
                        color: 0xffffff // handled by textures
                    };
                } else {
                    // Skip spawning if no model found for API item
                    continue;
                }
            } else {
                // If no API items, skip spawning entirely (loại bỏ rác mặc định)
                break;
            }

            // Find non-overlapping position within REACH
            let pos;
            let attempts = 0;
            do {
                const angle = randRange(-0.25 * Math.PI, 0.75 * Math.PI);
                const dist = randRange(this.minReach, this.maxReach - 2);
                pos = new THREE.Vector3(
                    Math.cos(angle) * dist,
                    WATER_DEPTH + randRange(1.2, 3.5), // Increased Y to avoid burial
                    Math.sin(angle) * dist,
                );
                attempts++;
            } while (
                attempts < 50 &&
                (usedPositions.some((p) => p.distanceTo(pos) < 3.5) ||
                    this.rocks.some((r) => {
                        const rockDist = new THREE.Vector3(r.position.x, pos.y, r.position.z).distanceTo(pos);
                        const threshold = r.scale.x > 2 ? 5.5 : 3.5;
                        return rockDist < threshold;
                    }))
            );
            usedPositions.push(pos);

            mesh.position.copy(pos);
            mesh.rotation.set(
                randRange(0, Math.PI * 2),
                randRange(0, Math.PI * 2),
                randRange(0, Math.PI * 2),
            );

            mesh.userData = {
                type: "trash",
                def,
                weight: def.weight,
                grabbed: false,
                bobPhase: Math.random() * Math.PI * 2,
                originalY: pos.y,
            };
            this.trashObjects.push(mesh);
            this.scene.add(mesh);
        }
    }



    async _loadEnvironmentModels() {
        const loader = new GLTFLoader();

        const loadRock = new Promise((resolve) => {
            loader.load(
                "/assets/rock.glb",
                (gltf) => {
                    this.rockModel = gltf.scene;
                    // Pre-calculate normalization for rock
                    const box = new THREE.Box3().setFromObject(this.rockModel);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) {
                        this.rockModel.scale.setScalar(1.5 / maxDim);
                    }
                    this.rockModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            // Ensure no clipping planes from the model are active
                            if (child.material) {
                                child.material.clippingPlanes = null;
                                child.material.clipShadows = false;
                            }
                        }
                    });
                    resolve();
                },
                undefined,
                (err) => {
                    console.warn("Failed to load /assets/rock.glb", err);
                    resolve();
                },
            );
        });

        this.anemoneModels = [];
        const loadAnemones = Array.from({ length: 12 }).map(() => {
            return new Promise((resolve) => {
                loader.load(
                    "/assets/anemone.glb",
                    (gltf) => {
                        const model = gltf.scene;
                        const box = new THREE.Box3().setFromObject(model);
                        const size = box.getSize(new THREE.Vector3());
                        const maxDim = Math.max(size.x, size.y, size.z);
                        if (maxDim > 0) {
                            model.scale.setScalar(4.0 / maxDim);
                        }
                        model.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;
                            }
                        });
                        this.anemoneModels.push(model);
                        resolve();
                    },
                    undefined,
                    (err) => {
                        console.warn("Failed to load /assets/anemone.glb", err);
                        resolve();
                    }
                );
            });
        });

        this.clownFishModels = [];
        this.fishAnimatedModels = [];
        const loadFish = (url, array, count, scaleTarget) => {
            return Array.from({ length: count }).map(() => {
                return new Promise((resolve) => {
                    loader.load(
                        url,
                        (gltf) => {
                            const model = gltf.scene;
                            const box = new THREE.Box3().setFromObject(model);
                            const size = box.getSize(new THREE.Vector3());
                            const maxDim = Math.max(size.x, size.y, size.z);
                            if (maxDim > 0) {
                                model.scale.setScalar(scaleTarget / maxDim);
                            }
                            model.traverse((child) => {
                                if (child.isMesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });
                            array.push({ scene: model, animations: gltf.animations });
                            resolve();
                        },
                        undefined,
                        (err) => {
                            console.warn("Failed to load " + url, err);
                            resolve();
                        }
                    );
                });
            });
        };

        const clownFishPromises = loadFish("/assets/clown_fish.glb", this.clownFishModels, 5, 1.2);
        const animatedFishPromises = loadFish("/assets/fish_animated.glb", this.fishAnimatedModels, 5, 1.6);
        const turtlePromises = loadFish("/assets/turtle.glb", this.turtleModels, 2, 3.0);

        return Promise.all([loadRock, ...loadAnemones, ...clownFishPromises, ...animatedFishPromises, ...turtlePromises]);
    }

    // ─── Model Loading ────────────────────────────────────────────────────────

    async _loadTrashModels(onProgress) {
        if (!this.wasteItems || this.wasteItems.length === 0) return;

        const manager = new THREE.LoadingManager();
        const loader = new GLTFLoader(manager);
        const total = this.wasteItems.length;
        let loaded = 0;

        const promises = this.wasteItems.map(async (item) => {
            // Priority 1: Use preloaded model if available (already a Three.js object)
            if (item.preloadedModel) {
                this._modelCache.set(item.wasteItemId || item.id, item.preloadedModel);
                loaded++;
                if (onProgress) {
                    const pct = 50 + (loaded / total) * 20;
                    onProgress(Math.round(pct));
                }
                return;
            }

            // Priority 2: Load from URL
            const url = item.presignedModel3dUrl || item.imagePresignedUrl;
            if (!url || typeof url !== "string") {
                loaded++;
                return;
            }

            return new Promise((resolve) => {
                loader.load(
                    url,
                    (gltf) => {
                        this._modelCache.set(item.wasteItemId || item.id, gltf.scene);
                        loaded++;
                        if (onProgress) {
                            const pct = 50 + (loaded / total) * 20;
                            onProgress(Math.round(pct));
                        }
                        resolve();
                    },
                    undefined,
                    (err) => {
                        console.warn(`Failed to load model for ${item.itemName || item.name}:`, err);
                        loaded++;
                        resolve();
                    },
                );
            });
        });

        await Promise.all(promises);
    }

    // ─── Marine Life (Obstacles) ──────────────────────────────────────────────

    _spawnMarineLife() {
        // Sea turtles
        for (let i = 0; i < 2; i++) {
            const turtle = this._createTurtle();
            const y = WATER_DEPTH + randRange(3, 7);
            const startX = randRange(-12, 12);
            const startZ = randRange(-12, 12);
            const speed = randRange(0.4, 0.8);

            turtle.position.set(startX, y, startZ);
            turtle.userData = {
                type: "marine",
                name: "Rùa biển",
                speed,
                direction: new THREE.Vector3(
                    randRange(-1, 1),
                    0,
                    randRange(-1, 1),
                ).normalize(),
                y,
                swimType: "linear",
                turnTimer: 0,
                turnInterval: randRange(4, 8),
            };

            this.marineLife.push(turtle);
            this.scene.add(turtle);
        }

        // Fish schools
        for (let i = 0; i < this.fishCount; i++) {
            const fish = this._createFish();
            const y = WATER_DEPTH + randRange(2, 8);
            const startX = randRange(-12, 12);
            const startZ = randRange(-12, 12);
            const speed = randRange(1, 3);

            fish.position.set(startX, y, startZ);
            fish.userData = {
                ...fish.userData,
                type: "marine",
                name: "Cá",
                speed,
                direction: new THREE.Vector3(
                    randRange(-1, 1),
                    0,
                    randRange(-1, 1),
                ).normalize(),
                y,
                swimType: "linear",
                turnTimer: 0,
                turnInterval: randRange(2, 5),
            };

            this.marineLife.push(fish);
            this.scene.add(fish);
        }
    }

    _createTurtle() {
        if (this.turtleModels && this.turtleModels.length > 0) {
            const turtleData = this.turtleModels.pop();
            const group = new THREE.Group();
            const model = turtleData.scene;

            // Align model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            model.position.set(-center.x, -(center.y - size.y / 2), -center.z);
            group.add(model);

            // Setup animation
            if (turtleData.animations && turtleData.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(turtleData.animations[0]);
                action.play();
                group.userData.mixer = mixer;
            }
            return group;
        }

        const group = new THREE.Group();

        // Shell
        const shellGeo = new THREE.SphereGeometry(0.6, 8, 6);
        const shellMat = new THREE.MeshStandardMaterial({
            color: 0x4caf50,
            flatShading: true,
            roughness: 0.6,
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.scale.set(1, 0.5, 0.8);
        group.add(shell);

        // Shell pattern (hexagons on top)
        const patternMat = new THREE.MeshStandardMaterial({
            color: 0x2e7d32,
            flatShading: true,
        });
        for (let i = 0; i < 6; i++) {
            const hex = new THREE.Mesh(
                new THREE.CircleGeometry(0.12, 6),
                patternMat,
            );
            const angle = (i / 6) * Math.PI * 2;
            hex.position.set(
                Math.cos(angle) * 0.3,
                0.32,
                Math.sin(angle) * 0.25,
            );
            hex.rotation.x = -Math.PI / 2;
            group.add(hex);
        }

        // Head
        const headGeo = new THREE.SphereGeometry(0.18, 6, 5);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x66bb6a,
            flatShading: true,
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0.6, 0.05, 0);
        group.add(head);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
        eye1.position.set(0.72, 0.12, 0.1);
        const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
        eye2.position.set(0.72, 0.12, -0.1);
        group.add(eye1, eye2);

        // Flippers
        const flipGeo = new THREE.BoxGeometry(0.35, 0.06, 0.15);
        const flipMat = new THREE.MeshStandardMaterial({
            color: 0x66bb6a,
            flatShading: true,
        });

        const positions = [
            [0.2, -0.08, 0.45],
            [0.2, -0.08, -0.45],
            [-0.3, -0.08, 0.4],
            [-0.3, -0.08, -0.4],
        ];
        positions.forEach(([x, y, z]) => {
            const flip = new THREE.Mesh(flipGeo, flipMat);
            flip.position.set(x, y, z);
            flip.rotation.y = z > 0 ? 0.3 : -0.3;
            group.add(flip);
        });

        group.scale.setScalar(1.2);
        return group;
    }

    _createFish() {
        let fishData;
        if (Math.random() > 0.5 && this.clownFishModels && this.clownFishModels.length > 0) {
            fishData = this.clownFishModels.pop();
        } else if (this.fishAnimatedModels && this.fishAnimatedModels.length > 0) {
            fishData = this.fishAnimatedModels.pop();
        } else if (this.clownFishModels && this.clownFishModels.length > 0) {
            fishData = this.clownFishModels.pop();
        }

        if (fishData) {
            const group = new THREE.Group();
            const model = fishData.scene;

            // Align model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            model.position.set(-center.x, -(center.y - size.y / 2), -center.z);
            group.add(model);

            // Setup animation
            if (fishData.animations && fishData.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(fishData.animations[0]);
                action.play();
                group.userData.mixer = mixer;
            }
            return group;
        }

        // Fallback
        const group = new THREE.Group();
        const fishColors = [0xff6b6b, 0xfeca57, 0x48dbfb, 0xff9ff3, 0x00d2d3];
        const color = fishColors[Math.floor(Math.random() * fishColors.length)];

        const fishMat = new THREE.MeshStandardMaterial({
            color,
            flatShading: true,
            roughness: 0.5,
        });

        // Body
        const bodyGeo = new THREE.SphereGeometry(0.25, 6, 5);
        const body = new THREE.Mesh(bodyGeo, fishMat);
        body.scale.set(1.5, 0.8, 0.6);
        group.add(body);

        // Tail
        const tailGeo = new THREE.ConeGeometry(0.2, 0.3, 4);
        const tail = new THREE.Mesh(tailGeo, fishMat);
        tail.position.x = -0.35;
        tail.rotation.z = Math.PI / 2;
        group.add(tail);

        // Eye
        const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(0.22, 0.06, 0.12);
        group.add(eye);

        const pupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 4, 4),
            new THREE.MeshStandardMaterial({ color: 0x111111 }),
        );
        pupil.position.set(0.24, 0.06, 0.14);
        group.add(pupil);

        // Dorsal fin
        const finGeo = new THREE.ConeGeometry(0.08, 0.2, 3);
        const fin = new THREE.Mesh(finGeo, fishMat);
        fin.position.set(0, 0.2, 0);
        group.add(fin);

        group.scale.setScalar(0.8);
        return group;
    }

    // ─── Audio ────────────────────────────────────────────────────────────────

    _loadAudio() {
        try {
            this.audioListener = new THREE.AudioListener();
            this.camera.add(this.audioListener);

            const audioLoader = new THREE.AudioLoader();

            // Background music
            this.bgMusic = new THREE.Audio(this.audioListener);
            audioLoader.load('/assets/audio/music_game.mp3', (buffer) => {
                this.bgMusic.setBuffer(buffer);
                this.bgMusic.setLoop(true);
                this.bgMusic.setVolume(0.2);
                this.bgMusic.play();
            });

            // Collect sound
            this.collectSound = new THREE.Audio(this.audioListener);
            audioLoader.load('/assets/audio/collect.mp3', (buffer) => {
                this.collectSound.setBuffer(buffer);
                this.collectSound.setVolume(0.6);
            });
        } catch (e) {
            console.warn("Audio not available:", e);
        }
    }

    // ─── Event Listeners ──────────────────────────────────────────────────────

    _addEventListeners() {
        window.addEventListener("click", this._onClick);
        window.addEventListener("touchstart", this._onTouch, { passive: false });
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
        window.addEventListener("resize", this._onResize);
    }

    _removeEventListeners() {
        window.removeEventListener("click", this._onClick);
        window.removeEventListener("touchstart", this._onTouch);
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
        window.removeEventListener("resize", this._onResize);
    }

    _onKeyDown = (e) => {
        this.keys[e.code] = true;
        if (e.code === "Space" || e.code === "Enter") this.triggerInput();
    };

    _onKeyUp = (e) => {
        this.keys[e.code] = false;
    };

    _handleClick() {
        if (this.isGameOver) return;
        this.triggerInput();
    }

    _handleTouch(e) {
        if (this.isGameOver) return;
        // Check if it's a HUD element (buttons)
        if (e.target.closest('button')) return;
        
        e.preventDefault();
        this.triggerInput();
    }

    triggerInput() {
        this._processInput();
    }

    _handleResize() {
        this._setupCamera();
    }

    _processInput() {
        if (this.grabState === GrabState.MANUAL) {
            // Drop claw
            this.grabState = GrabState.DESCENDING;
            this._setClawOpen(true);
            if (this._cbInstructionUpdate)
                this._cbInstructionUpdate.forEach(cb => cb("Đang thả móc... Click để đóng gắp!"));
        } else if (this.grabState === GrabState.DESCENDING) {
            // Force grab at current depth
            this._tryGrab();
        }
    }

    // ─── Grab Logic ───────────────────────────────────────────────────────────

    _tryGrab() {
        this.grabState = GrabState.GRABBING;
        this._setClawOpen(false);

        // Check what's at the claw position
        const clawWorldPos = new THREE.Vector3();
        this.clawGroup.getWorldPosition(clawWorldPos);

        let closestObj = null;
        let closestDist = 3.5; // grab radius (increased for tires and large meshes)

        // Check trash
        this.trashObjects.forEach((trash) => {
            if (trash.userData.grabbed) return;
            const dist = clawWorldPos.distanceTo(trash.position);
            if (dist < closestDist) {
                closestDist = dist;
                closestObj = trash;
            }
        });

        // Check rocks
        this.rocks.forEach((rock) => {
            if (rock.userData.grabbed) return;
            const dist = clawWorldPos.distanceTo(rock.position);
            if (dist < closestDist) {
                closestDist = dist;
                closestObj = rock;
            }
        });

        if (closestObj) {
            closestObj.userData.grabbed = true;
            this.grabbedObject = closestObj;
            const name = closestObj.userData.name || "vật thể";
            if (this._cbInstructionUpdate)
                this._cbInstructionUpdate.forEach(cb => cb(`Đã gắp trúng ${name}! Đang kéo lên... 🎣`));
            this.grabState = GrabState.ASCENDING;
            this._setClawOpen(false);
        } else {
            // Nothing grabbed — still ascend
            if (this._cbInstructionUpdate)
                this._cbInstructionUpdate.forEach(cb => cb("Không gắp được gì! Kéo lên..."));
            this.grabState = GrabState.ASCENDING;
            this._setClawOpen(false);
        }
    }

    _completeGrab() {
        if (
            this.grabbedObject &&
            this.grabbedObject.userData.type === "trash"
        ) {
            const def = this.grabbedObject.userData.def;

            // Remove from scene
            this.scene.remove(this.grabbedObject);
            this.trashObjects = this.trashObjects.filter(
                (t) => t !== this.grabbedObject,
            );

            // Track
            this.trashCollected++;
            this.score += Math.ceil(def.weight * 10);

            // Pass trash info to callbacks — EcoGame.startStage1 will addTrash to stateManager
            if (this._cbTrashCollected) {
                this._cbTrashCollected.forEach(cb => cb(def));
            }

            if (this.collectSound && this.collectSound.buffer) {
                if (this.collectSound.isPlaying) this.collectSound.stop();
                this.collectSound.play();
            }

            // Update VFX
            this._updateEnvironmentVFX();

            // Check win condition
            const remaining = this.trashObjects.filter(
                (t) => !t.userData.grabbed,
            ).length;
            if (remaining === 0) {
                this._endGame("win");
                return;
            }
        } else if (
            this.grabbedObject &&
            this.grabbedObject.userData.type === "rock"
        ) {
            // Just remove rock from scene and list
            this.scene.remove(this.grabbedObject);
            this.rocks = this.rocks.filter((r) => r !== this.grabbedObject);
        }

        this.grabbedObject = null;
        this._setClawOpen(true);
        this.grabState = GrabState.MANUAL;

        if (this._cbInstructionUpdate)
            this._cbInstructionUpdate.forEach(cb => cb("Sử dụng WASD để di chuyển & Click/Space để gắp!"));
    }

    // ─── Environment VFX ──────────────────────────────────────────────────────

    _updateEnvironmentVFX() {
        const totalTrash = this.config.totalTrash;
        const cleaned = this.trashCollected;
        this.waterClarity = cleaned / totalTrash;

        // Water color: murky → clear
        const murkyColor = new THREE.Color(0x3a6b5e);
        const clearColor = new THREE.Color(0x40c4ff);
        const waterColor = murkyColor.clone().lerp(clearColor, this.waterClarity);
        if (this.waterPlane) {
            this.waterPlane.material.color.copy(waterColor);
            this.waterPlane.material.opacity = 0.55 - this.waterClarity * 0.2;
        }

        // Fog: dense → light
        if (this.scene.fog) {
            this.scene.fog.density = 0.015 - this.waterClarity * 0.01;
        }

        // Coral bloom
        this.coralObjects.forEach((coral) => {
            const target =
                coral.userData.baseScale +
                (coral.userData.maxScale - coral.userData.baseScale) *
                this.waterClarity;
            gsap.to(coral.scale, {
                x: target,
                y: target,
                z: target,
                duration: 1.5,
                ease: "power2.out",
            });
        });

        // Spawn more fish
        const newFishCount = 3 + Math.floor(this.waterClarity * 6);
        while (this.marineLife.filter((m) => m.userData.swimType === "linear").length < newFishCount) {
            const fish = this._createFish();
            const y = WATER_DEPTH + randRange(2, 8);
            fish.position.set(randRange(-12, 12), y, randRange(-12, 12));
            fish.userData = {
                ...fish.userData,
                type: "marine",
                name: "Cá",
                speed: randRange(1, 3),
                direction: new THREE.Vector3(
                    randRange(-1, 1),
                    0,
                    randRange(-1, 1),
                ).normalize(),
                y,
                swimType: "linear",
                turnTimer: 0,
                turnInterval: randRange(2, 5),
            };
            this.marineLife.push(fish);
            this.scene.add(fish);
        }

        // Update distance callback with clarity percentage
        if (this._cbDistanceUpdate) {
            this._cbDistanceUpdate.forEach(cb => cb(
                Math.round(this.waterClarity * 100),
                this.score,
            ));
        }
    }

    // ─── Game End ─────────────────────────────────────────────────────────────

    _endGame(reason) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this._removeEventListeners();

        if (this._cbStageComplete) {
            this._cbStageComplete.forEach(cb => cb(reason, this.trashCollected));
        }
    }

    // ─── Update Loop ──────────────────────────────────────────────────────────

    update(delta) {
        if (this.isGameOver) return;

        // Timer
        this.timeLeft -= delta;
        if (this._cbTimerUpdate) {
            this._cbTimerUpdate.forEach(cb => cb(Math.ceil(this.timeLeft)));
        }

        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this._endGame("timeout");
            return;
        }

        // ── Movement Input Processing ──
        let moveX = 0; // Rotation
        let moveY = 0; // Reach

        // Keyboard
        if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveX -= 1;
        if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveX += 1;
        if (this.keys["KeyW"] || this.keys["ArrowUp"]) moveY += 1;
        if (this.keys["KeyS"] || this.keys["ArrowDown"]) moveY -= 1;

        // Joystick (Mobile) overrides or adds to keyboard
        if (Math.abs(this.joystick.x) > 0.1) moveX = this.joystick.x;
        if (Math.abs(this.joystick.y) > 0.1) moveY = -this.joystick.y; // Invert Y for reach (Up = Out)

        // ── Manual Control ──
        if (this.grabState === GrabState.MANUAL) {
            if (moveX !== 0) {
                this.craneAngle += moveX * this.config.rotationSpeed * delta;
            }
            this.armGroup.rotation.y = this.craneAngle;

            // Reach
            if (moveY !== 0) {
                this.reachRatio += moveY * delta * 1.5;
            }
            this.reachRatio = Math.max(0, Math.min(1, this.reachRatio));

            this.currentReach = this.minReach + (this.maxReach - this.minReach) * this.reachRatio;
            this.cableGroup.position.x = this.currentReach;
        }

        // ── Update Target Shadow Position ──
        if (this.targetShadow && this.clawGroup) {
            const clawPos = new THREE.Vector3();
            this.clawGroup.getWorldPosition(clawPos);
            this.targetShadow.position.x = clawPos.x;
            this.targetShadow.position.z = clawPos.z;

            // Opacity/Scale based on depth (keep visible even at top)
            const distToFloor = clawPos.y - WATER_DEPTH;
            const factor = Math.max(0, 1 - distToFloor / 25);
            this.targetShadow.material.opacity = 0.2 + 0.4 * factor;
            this.targetShadow.scale.setScalar(1.2 + factor * 1.0);
            this.targetShadow.visible = !this.isGameOver;
        }

        // ── Claw descent ──
        if (this.grabState === GrabState.DESCENDING) {
            const descent = this.config.descentSpeed * delta;
            this.clawGroup.position.y -= descent;

            // Update cable length
            const cableLength = Math.abs(this.clawGroup.position.y) + 1;
            this.cable.scale.y = cableLength;
            this.cable.position.y = -cableLength / 2;

            // Auto-grab at max depth
            if (this.clawGroup.position.y < WATER_DEPTH - CRANE_BASE_Y - 3) {
                this._tryGrab();
            }
        }

        // ── Ascent ──
        if (this.grabState === GrabState.ASCENDING) {
            const weight = this.grabbedObject?.userData?.weight || 1;
            const ascentSpeed = this.config.ascentSpeed / (weight * 0.5 + 0.5);
            this.clawGroup.position.y += ascentSpeed * delta;

            // Heavy trash = sway
            if (this.grabbedObject && weight > 2) {
                const sway = Math.sin(Date.now() * 0.005) * 0.02 * weight;
                this.clawGroup.rotation.z = sway;
            }

            // Move grabbed object with claw
            if (this.grabbedObject) {
                const clawWorld = new THREE.Vector3();
                this.clawGroup.getWorldPosition(clawWorld);
                this.grabbedObject.position.copy(clawWorld);
                this.grabbedObject.position.y -= 0.5;
            }

            // Update cable
            const cableLength = Math.abs(this.clawGroup.position.y) + 1;
            this.cable.scale.y = Math.max(1, cableLength);
            this.cable.position.y = -cableLength / 2;

            // Reached top
            if (this.clawGroup.position.y >= -1) {
                this.clawGroup.position.y = -1;
                this.cable.scale.y = 1;
                this.cable.position.y = -0.5;
                this.clawGroup.rotation.z = 0;
                this._completeGrab();
            }
        }

        // ── Water animation ──
        if (this.waterPlane) {
            const time = Date.now() * 0.001;
            const posAttr = this.waterPlane.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                const baseZ = this._waterVertices[i * 3 + 2];
                const x = posAttr.getX(i);
                const y = posAttr.getY(i);
                posAttr.setZ(
                    i,
                    baseZ + Math.sin(x * 0.5 + time) * 0.15 + Math.cos(y * 0.3 + time * 0.7) * 0.1,
                );
            }
            posAttr.needsUpdate = true;
        }

        // ── Marine life animation ──
        this.marineLife.forEach((marine) => {
            const data = marine.userData;
            if (data.mixer) {
                data.mixer.update(delta);
            }
            if (data.swimType === "circle") {
                data.phase += data.speed * delta;
                marine.position.x = Math.cos(data.phase) * data.radius;
                marine.position.z = Math.sin(data.phase) * data.radius;
                marine.position.y =
                    data.y + Math.sin(data.phase * 2) * 0.3;
                // Face movement direction
                marine.rotation.y = -data.phase + Math.PI / 2;
            } else if (data.swimType === "linear") {
                marine.position.x += data.direction.x * data.speed * delta;
                marine.position.z += data.direction.z * data.speed * delta;
                marine.position.y =
                    data.y + Math.sin(Date.now() * 0.002 + marine.id) * 0.2;

                // Turn timer
                data.turnTimer += delta;
                if (data.turnTimer >= data.turnInterval) {
                    data.turnTimer = 0;
                    data.direction
                        .set(randRange(-1, 1), 0, randRange(-1, 1))
                        .normalize();
                }

                // Boundary check
                if (
                    Math.abs(marine.position.x) > 14 ||
                    Math.abs(marine.position.z) > 14
                ) {
                    data.direction.negate();
                }

                // Face direction
                marine.rotation.y = Math.atan2(data.direction.x, data.direction.z);
            }
        });

        // ── Trash bobbing ──
        this.trashObjects.forEach((trash) => {
            if (trash.userData.grabbed) return;
            const bob = trash.userData;
            trash.position.y =
                bob.originalY + Math.sin(Date.now() * 0.001 + bob.bobPhase) * 0.15;
            trash.rotation.y += delta * 0.2;
        });

        // ── Bubble particles (simple) ──
        if (
            this.grabState === GrabState.DESCENDING ||
            this.grabState === GrabState.ASCENDING
        ) {
            if (Math.random() < 0.3) {
                this._spawnBubble();
            }
        }
        this._updateBubbles(delta);
    }

    // ─── Bubbles ──────────────────────────────────────────────────────────────

    _spawnBubble() {
        const clawWorld = new THREE.Vector3();
        this.clawGroup.getWorldPosition(clawWorld);

        // Only spawn bubbles when claw is underwater
        if (clawWorld.y > 0) return;

        const bubble = new THREE.Mesh(
            new THREE.SphereGeometry(randRange(0.03, 0.1), 6, 6),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5,
                roughness: 0.1,
            }),
        );
        bubble.position.set(
            clawWorld.x + randRange(-0.3, 0.3),
            clawWorld.y,
            clawWorld.z + randRange(-0.3, 0.3),
        );
        bubble.userData.life = 2;
        bubble.userData.speed = randRange(1, 3);

        this.bubbleParticles.push(bubble);
        this.scene.add(bubble);
    }

    _updateBubbles(delta) {
        for (let i = this.bubbleParticles.length - 1; i >= 0; i--) {
            const b = this.bubbleParticles[i];
            b.position.y += b.userData.speed * delta;
            b.userData.life -= delta;
            b.material.opacity = b.userData.life * 0.25;

            if (b.userData.life <= 0 || b.position.y > 0.5) {
                this.scene.remove(b);
                b.geometry.dispose();
                b.material.dispose();
                this.bubbleParticles.splice(i, 1);
            }
        }
    }

    // ─── Callbacks (same interface as Runner/SeaRescue) ───────────────────────

    onTrashCollected(callback) {
        if (!this._cbTrashCollected) this._cbTrashCollected = [];
        this._cbTrashCollected.push(callback);
    }

    onDistanceUpdate(callback) {
        if (!this._cbDistanceUpdate) this._cbDistanceUpdate = [];
        this._cbDistanceUpdate.push(callback);
    }

    onStageComplete(callback) {
        if (!this._cbStageComplete) this._cbStageComplete = [];
        this._cbStageComplete.push(callback);
    }

    onTimerUpdate(callback) {
        if (!this._cbTimerUpdate) this._cbTimerUpdate = [];
        this._cbTimerUpdate.push(callback);
    }

    onInstructionUpdate(callback) {
        if (!this._cbInstructionUpdate) this._cbInstructionUpdate = [];
        this._cbInstructionUpdate.push(callback);
    }

    setJoystick(x, y) {
        this.joystick.x = x;
        this.joystick.y = y;
    }

    resetJoystick() {
        this.joystick.x = 0;
        this.joystick.y = 0;
    }

    // ─── Dispose ──────────────────────────────────────────────────────────────

    dispose() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        this._removeEventListeners();
        this.isGameOver = true;

        // Kill GSAP tweens
        gsap.killTweensOf(this.clawProngs);
        this.coralObjects.forEach((c) => gsap.killTweensOf(c.scale));

        // Dispose helpers
        const disposeMesh = (obj) => {
            if (!obj) return;
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach((m) => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        };

        const disposeGroup = (group) => {
            if (!group) return;
            group.traverse(disposeMesh);
            this.scene.remove(group);
        };

        // Crane
        disposeGroup(this.craneGroup);

        // Trash (DO NOT dispose meshes, they are shared/cached and needed for Stage 2)
        this.trashObjects.forEach((t) => this.scene.remove(t));
        this.trashObjects = [];

        // Marine life (DO NOT dispose meshes, they are shared/cached)
        this.marineLife.forEach((m) => this.scene.remove(m));
        this.marineLife = [];

        // Coral
        this.coralObjects.forEach((c) => this.scene.remove(c));
        this.coralObjects = [];

        // Bubbles
        this.bubbleParticles.forEach((b) => {
            this.scene.remove(b);
            b.geometry.dispose();
            b.material.dispose();
        });
        this.bubbleParticles = [];

        // Water & floor
        if (this.waterPlane) {
            disposeMesh(this.waterPlane);
            this.scene.remove(this.waterPlane);
        }
        if (this.targetShadow) {
            this.scene.remove(this.targetShadow);
            this.targetShadow.geometry.dispose();
            this.targetShadow.material.dispose();
        }
        if (this.seaFloor) {
            disposeMesh(this.seaFloor);
            this.scene.remove(this.seaFloor);
        }

        // Rocks and remaining scene children
        const toRemove = [];
        this.scene.traverse((child) => {
            if (child !== this.scene && child.isLight === false) {
                toRemove.push(child);
            }
        });

        // Audio
        if (this.audioListener) {
            this.camera.remove(this.audioListener);
        }

        // Remove fog
        this.scene.fog = null;
    }
}
