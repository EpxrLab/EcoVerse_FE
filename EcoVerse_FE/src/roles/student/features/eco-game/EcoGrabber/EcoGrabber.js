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

// Trash definitions (low-poly procedural)
const GRABBER_TRASH_DEFS = [
    {
        id: "plastic_bag",
        name: "Túi nilon",
        bin: "general",
        weight: 1,
        color: 0xffffff, // Brighter white
        shape: "bag",
    },
    {
        id: "plastic_bottle",
        name: "Chai nhựa",
        bin: "recyclable",
        weight: 1,
        color: 0x00ffff, // Cyan/Bright blue
        shape: "bottle",
    },
    {
        id: "can",
        name: "Vỏ lon",
        bin: "recyclable",
        weight: 1.5,
        color: 0xffd700, // Gold/Bright Yellow
        shape: "can",
    },
    {
        id: "tire",
        name: "Lốp xe cũ",
        bin: "general",
        weight: 4,
        color: 0xff00ff, // Magenta (to stand out)
        shape: "tire",
    },
    {
        id: "tv",
        name: "TV hỏng",
        bin: "hazardous",
        weight: 5,
        color: 0x39ff14, // Neon Green
        shape: "tv",
    },
    {
        id: "fish_bone",
        name: "Xương cá",
        bin: "organic",
        weight: 2,
        color: 0xff8c00, // Bright Orange
        shape: "fishbone",
    },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function createRoundedBoxGeometry(w, h, d, r = 0.05) {
    // Simple box with bevel – approximated with RoundedBoxGeometry fallback
    return new THREE.BoxGeometry(w, h, d, 2, 2, 2);
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
        this._wasteItems = wasteItems;

        // Config with defaults
        this.config = {
            gameTime: config.gameTime ?? 90,
            rotationSpeed: config.rotationSpeed ?? 1.2,
            descentSpeed: config.descentSpeed ?? 5,
            ascentSpeed: config.ascentSpeed ?? 4,
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

        // VFX state
        this.waterClarity = 0; // 0=dirty, 1=clean
        this.fishCount = 3;
        this.coralBloom = 0;

        // Callbacks (same interface as Runner/SeaRescue)
        this._onTrashCollected = null;
        this._onDistanceUpdate = null;
        this._onStageComplete = null;
        this._onTimerUpdate = null;
        this._onInstructionUpdate = null;

        // Audio
        this.audioListener = null;
        this.sounds = {};

        // Bound handlers
        this._onClick = this._handleClick.bind(this);
        this._onTouch = this._handleTouch.bind(this);
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    async init(onProgress = null) {
        if (onProgress) onProgress(5);

        // Setup camera (isometric-like perspective)
        this._setupCamera();
        if (onProgress) onProgress(10);

        // Create environment
        this._createLighting();
        if (onProgress) onProgress(20);

        this._createWater();
        if (onProgress) onProgress(30);

        this._createSeaFloor();
        if (onProgress) onProgress(40);

        this._createCoral();
        if (onProgress) onProgress(50);

        // Create crane
        this._createCrane();
        if (onProgress) onProgress(60);

        // Load API models if available
        await this._loadTrashModels(onProgress);
        if (onProgress) onProgress(70);

        // Spawn trash
        this._spawnTrash();
        if (onProgress) onProgress(80);

        // Spawn marine life
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
        this.camera.position.set(18, 16, 18);
        this.camera.lookAt(0, -2, 0);
        this.camera.fov = 50;
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
        for (let i = 0; i < 8; i++) {
            const rockGeo = new THREE.DodecahedronGeometry(randRange(0.5, 1.5), 0);
            const rockMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.08, 0.15, randRange(0.3, 0.5)),
                flatShading: true,
                roughness: 0.85,
            });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.set(
                randRange(-15, 15),
                WATER_DEPTH + randRange(0.2, 0.8),
                randRange(-15, 15),
            );
            rock.rotation.set(
                randRange(0, Math.PI),
                randRange(0, Math.PI),
                randRange(0, Math.PI),
            );
            rock.scale.y = randRange(0.5, 1);
            rock.castShadow = true;
            rock.userData = {
                type: "rock",
                weight: 8, // Heavy!
                grabbed: false,
                name: "Cục đá",
            };
            this.rocks.push(rock);
            this.scene.add(rock);
        }
    }

    // ─── Coral ────────────────────────────────────────────────────────────────

    _createCoral() {
        const coralColors = [0xff6b6b, 0xff9ff3, 0xfeca57, 0x48dbfb, 0xff6348];

        for (let i = 0; i < 12; i++) {
            const coralGroup = new THREE.Group();
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

            coralGroup.position.set(
                randRange(-14, 14),
                WATER_DEPTH,
                randRange(-14, 14),
            );
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
        const hasApiItems = this.wasteItems && this.wasteItems.length > 0;

        for (let i = 0; i < count; i++) {
            let mesh;
            let def;

            if (hasApiItems) {
                const apiItem = this.wasteItems[i % this.wasteItems.length];
                const itemId = apiItem.wasteItemId || apiItem.id;
                const cachedModel = this._modelCache.get(itemId);

                if (cachedModel) {
                    mesh = cachedModel.clone(true);
                    // Normalize and scale
                    const box = new THREE.Box3().setFromObject(mesh);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) mesh.scale.multiplyScalar(1.8 / maxDim);

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
                        id: itemId,
                        name: apiItem.itemName || apiItem.name,
                        bin: binMap[cat] || "general",
                        weight: randRange(1, 3),
                        color: 0xffffff // handled by textures
                    };
                } else {
                    def = GRABBER_TRASH_DEFS[i % GRABBER_TRASH_DEFS.length];
                    mesh = this._createTrashMesh(def);
                }
            } else {
                def = GRABBER_TRASH_DEFS[i % GRABBER_TRASH_DEFS.length];
                mesh = this._createTrashMesh(def);
            }

            // Find non-overlapping position within REACH
            let pos;
            let attempts = 0;
            do {
                const angle = Math.random() * Math.PI * 2;
                const dist = randRange(this.minReach, this.maxReach - 1.5);
                pos = new THREE.Vector3(
                    Math.cos(angle) * dist,
                    WATER_DEPTH + randRange(0.5, 4),
                    Math.sin(angle) * dist,
                );
                attempts++;
            } while (
                attempts < 50 &&
                usedPositions.some((p) => p.distanceTo(pos) < 3.5)
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

    _createTrashMesh(def) {
        let mesh;
        const mat = new THREE.MeshStandardMaterial({
            color: def.color,
            flatShading: true,
            roughness: 0.6,
            metalness: 0.2,
            emissive: def.color,
            emissiveIntensity: 0.2, // Glow to stand out
        });

        switch (def.shape) {
            case "bottle": {
                const group = new THREE.Group();
                const body = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.2, 0.7, 6),
                    mat,
                );
                const neck = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.15, 0.3, 6),
                    mat,
                );
                neck.position.y = 0.5;
                const cap = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.12, 0.08, 6),
                    new THREE.MeshStandardMaterial({
                        color: 0xff5722,
                        flatShading: true,
                    }),
                );
                cap.position.y = 0.65;
                group.add(body, neck, cap);
                mesh = group;
                break;
            }
            case "can": {
                const canGroup = new THREE.Group();
                const canBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.22, 0.22, 0.5, 8),
                    mat,
                );
                const rimMat = new THREE.MeshStandardMaterial({
                    color: 0xbdbdbd,
                    metalness: 0.6,
                    flatShading: true,
                });
                const topRim = new THREE.Mesh(
                    new THREE.TorusGeometry(0.22, 0.03, 4, 8),
                    rimMat,
                );
                topRim.rotation.x = Math.PI / 2;
                topRim.position.y = 0.25;
                canGroup.add(canBody, topRim);
                mesh = canGroup;
                break;
            }
            case "bag": {
                const bagGroup = new THREE.Group();
                const bagBody = new THREE.Mesh(
                    new THREE.SphereGeometry(0.4, 6, 5),
                    new THREE.MeshStandardMaterial({
                        color: def.color,
                        flatShading: true,
                        roughness: 0.8,
                        transparent: true,
                        opacity: 0.7,
                    }),
                );
                bagBody.scale.set(1, 0.7, 0.8);
                // Handles
                const handleGeo = new THREE.TorusGeometry(0.15, 0.02, 4, 8, Math.PI);
                const handleMat = new THREE.MeshStandardMaterial({
                    color: def.color,
                    transparent: true,
                    opacity: 0.7,
                });
                const handle1 = new THREE.Mesh(handleGeo, handleMat);
                handle1.position.set(-0.1, 0.25, 0);
                handle1.rotation.z = 0.2;
                const handle2 = new THREE.Mesh(handleGeo, handleMat);
                handle2.position.set(0.1, 0.25, 0);
                handle2.rotation.z = -0.2;
                bagGroup.add(bagBody, handle1, handle2);
                mesh = bagGroup;
                break;
            }
            case "tire": {
                mesh = new THREE.Mesh(
                    new THREE.TorusGeometry(0.6, 0.25, 8, 12),
                    mat,
                );
                break;
            }
            case "tv": {
                const tvGroup = new THREE.Group();
                const tvBody = new THREE.Mesh(
                    new THREE.BoxGeometry(0.9, 0.7, 0.5),
                    mat,
                );
                const screenMat = new THREE.MeshStandardMaterial({
                    color: 0x1a1a2e,
                    roughness: 0.3,
                    metalness: 0.2,
                });
                const screen = new THREE.Mesh(
                    new THREE.BoxGeometry(0.7, 0.5, 0.02),
                    screenMat,
                );
                screen.position.z = 0.26;
                // Antenna
                const antennaGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 4);
                const antMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
                const ant1 = new THREE.Mesh(antennaGeo, antMat);
                ant1.position.set(-0.2, 0.5, 0);
                ant1.rotation.z = 0.3;
                const ant2 = new THREE.Mesh(antennaGeo, antMat);
                ant2.position.set(0.2, 0.5, 0);
                ant2.rotation.z = -0.3;
                tvGroup.add(tvBody, screen, ant1, ant2);
                mesh = tvGroup;
                break;
            }
            case "fishbone": {
                const boneGroup = new THREE.Group();
                // Spine
                const spineGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4);
                const boneMat = new THREE.MeshStandardMaterial({
                    color: def.color,
                    flatShading: true,
                });
                const spine = new THREE.Mesh(spineGeo, boneMat);
                spine.rotation.z = Math.PI / 2;
                boneGroup.add(spine);
                // Ribs
                for (let r = -4; r <= 4; r++) {
                    if (r === 0) continue;
                    const ribGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 3);
                    const rib = new THREE.Mesh(ribGeo, boneMat);
                    rib.position.x = r * 0.12;
                    rib.position.y = r > 0 ? 0.15 : -0.15;
                    rib.rotation.z = r > 0 ? 0.4 : -0.4;
                    boneGroup.add(rib);
                }
                // Head
                const headGeo = new THREE.SphereGeometry(0.15, 5, 5);
                const head = new THREE.Mesh(headGeo, boneMat);
                head.position.x = 0.65;
                head.scale.set(1.2, 1, 0.7);
                boneGroup.add(head);
                // Tail
                const tailGeo = new THREE.ConeGeometry(0.12, 0.25, 4);
                const tail = new THREE.Mesh(tailGeo, boneMat);
                tail.position.x = -0.65;
                tail.rotation.z = Math.PI / 2;
                boneGroup.add(tail);
                mesh = boneGroup;
                break;
            }
            default: {
                mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat);
            }
        }

        mesh.castShadow = true;
        mesh.scale.setScalar(1.5); // Increase visibility
        return mesh;
    }

    // ─── Model Loading ────────────────────────────────────────────────────────

    async _loadTrashModels(onProgress) {
        if (!this.wasteItems || this.wasteItems.length === 0) return;

        const manager = new THREE.LoadingManager();
        const loader = new GLTFLoader(manager);
        const total = this.wasteItems.length;
        let loaded = 0;

        const promises = this.wasteItems.map(async (item) => {
            const url = item.model3dPresignedUrl || item.modelUrl || item.preloadedModel;
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
                        console.warn(`Failed to load model for ${item.name}:`, err);
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
            const radius = randRange(6, 12);
            const speed = randRange(0.3, 0.6);
            const phase = randRange(0, Math.PI * 2);

            turtle.position.set(
                Math.cos(phase) * radius,
                y,
                Math.sin(phase) * radius,
            );
            turtle.userData = {
                type: "marine",
                name: "Rùa biển",
                radius,
                speed,
                phase,
                y,
                swimType: "circle",
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
        } catch (e) {
            console.warn("Audio not available:", e);
        }
    }

    // ─── Event Listeners ──────────────────────────────────────────────────────

    _addEventListeners() {
        const canvas = this.scene?.userData?.renderer?.domElement;
        window.addEventListener("click", this._onClick);
        window.addEventListener("touchstart", this._onTouch, { passive: false });
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }

    _removeEventListeners() {
        window.removeEventListener("click", this._onClick);
        window.removeEventListener("touchstart", this._onTouch);
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }

    _onKeyDown = (e) => {
        this.keys[e.code] = true;
        if (e.code === "Space") this._processInput();
    };

    _onKeyUp = (e) => {
        this.keys[e.code] = false;
    };

    _handleClick(e) {
        if (this.isGameOver) return;
        this._processInput();
    }

    _handleTouch(e) {
        if (this.isGameOver) return;
        e.preventDefault();
        this._processInput();
    }

    _processInput() {
        if (this.grabState === GrabState.MANUAL) {
            // Drop claw
            this.grabState = GrabState.DESCENDING;
            this._setClawOpen(true);
            if (this._onInstructionUpdate)
                this._onInstructionUpdate("Đang thả móc... Click để đóng gắp!");
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
            if (this._onInstructionUpdate)
                this._onInstructionUpdate(`Đã gắp trúng ${name}! Đang kéo lên... 🎣`);
            this.grabState = GrabState.ASCENDING;
            this._setClawOpen(false);
        } else {
            // Nothing grabbed — still ascend
            if (this._onInstructionUpdate)
                this._onInstructionUpdate("Không gắp được gì! Kéo lên...");
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

            // Pass trash info to callback — EcoGame.startStage1 will addTrash to stateManager
            if (this._onTrashCollected) {
                this._onTrashCollected({
                    id: def.id,
                    name: def.name,
                    bin: def.bin,
                    color: def.color,
                });
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

        if (this._onInstructionUpdate)
            this._onInstructionUpdate("Sử dụng WASD để di chuyển & Click/Space để gắp!");
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
        if (this._onDistanceUpdate) {
            this._onDistanceUpdate(
                Math.round(this.waterClarity * 100),
                this.score,
            );
        }
    }

    // ─── Game End ─────────────────────────────────────────────────────────────

    _endGame(reason) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this._removeEventListeners();

        if (this._onStageComplete) {
            this._onStageComplete(reason, this.trashCollected);
        }
    }

    // ─── Update Loop ──────────────────────────────────────────────────────────

    update(delta) {
        if (this.isGameOver) return;

        // Timer
        this.timeLeft -= delta;
        if (this._onTimerUpdate) this._onTimerUpdate(Math.ceil(this.timeLeft));

        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this._endGame("timeout");
            return;
        }

        // ── Manual Control ──
        if (this.grabState === GrabState.MANUAL) {
            // Rotation (A/D or Arrows)
            if (this.keys["KeyA"] || this.keys["ArrowLeft"]) {
                this.craneAngle += this.config.rotationSpeed * delta;
            }
            if (this.keys["KeyD"] || this.keys["ArrowRight"]) {
                this.craneAngle -= this.config.rotationSpeed * delta;
            }
            this.armGroup.rotation.y = this.craneAngle;

            // Reach (W/S or Arrows)
            if (this.keys["KeyW"] || this.keys["ArrowUp"]) {
                this.reachRatio += delta * 1.5;
            }
            if (this.keys["KeyS"] || this.keys["ArrowDown"]) {
                this.reachRatio -= delta * 1.5;
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
        this._onTrashCollected = callback;
    }

    onDistanceUpdate(callback) {
        this._onDistanceUpdate = callback;
    }

    onStageComplete(callback) {
        this._onStageComplete = callback;
    }

    onTimerUpdate(callback) {
        this._onTimerUpdate = callback;
    }

    onInstructionUpdate(callback) {
        this._onInstructionUpdate = callback;
    }

    // ─── Dispose ──────────────────────────────────────────────────────────────

    dispose() {
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

        // Trash
        this.trashObjects.forEach((t) => disposeGroup(t));
        this.trashObjects = [];

        // Marine life
        this.marineLife.forEach((m) => disposeGroup(m));
        this.marineLife = [];

        // Coral
        this.coralObjects.forEach((c) => disposeGroup(c));
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
