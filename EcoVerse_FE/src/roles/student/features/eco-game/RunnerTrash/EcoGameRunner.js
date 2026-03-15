/**
 * EcoGameRunner - Stage 1: Endless Runner
 *
 * 3-lane endless runner where the player collects trash and avoids obstacles.
 * Uses AABB collision detection and GSAP for smooth animations.
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { SPAWNABLE_TRASH } from '../EcoGameStateManager';
import { DEFAULT_LEVEL_CONFIG } from '../gameConfig';

// ─── Fixed Constants (not configurable) ──────────────────────────────────────

const LANE_WIDTH = 2.5;
const LANES = [-LANE_WIDTH, 0, LANE_WIDTH]; // left, center, right
const PLAYER_SIZE = { w: 0.8, h: 1.4, d: 0.8 };
const GROUND_SEGMENT_LENGTH = 50;
const OBSTACLE_TYPES = [
  { name: 'crate', color: 0x8d6e63, w: 1.0, h: 1.0, d: 1.0 },
  { name: 'barrier', color: 0xef5350, w: 1.8, h: 1.2, d: 0.4 },
];

export default class EcoGameRunner {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Camera} camera
   * @param {EcoGameStateManager} stateManager
   * @param {object} config - Runner config from API (runner sub-object of GameLevelConfig)
   */
  constructor(scene, camera, stateManager, config = {}) {
    this.scene = scene;
    this.camera = camera;
    this.stateManager = stateManager;

    // Merge provided config with defaults
    const defaults = DEFAULT_LEVEL_CONFIG.runner;
    this.config = { ...defaults, ...config };

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

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
  }

  // ─── Initialization ─────────────────────────────────────────────────────────

  init() {
    this._createGround();
    this._createPlayer();
    this._createEnvironment();
    this._setupCamera();
    this._addEventListeners();

    this.isRunning = true;
    this.gameOver = false;
    this.speed = this.config.baseSpeed;
    this.distance = 0;
    this.spawnTimer = 0;
    this.nextSpawnTime = 1.0;
  }

  _createGround() {
    // Create scrolling ground segments
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x607d8b, roughness: 0.8 });

    for (let i = 0; i < 6; i++) {
      const groundGeo = new THREE.BoxGeometry(LANE_WIDTH * 3 + 2, 0.2, GROUND_SEGMENT_LENGTH);
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.set(0, -0.8, -i * GROUND_SEGMENT_LENGTH + 10);
      ground.receiveShadow = true;
      this.scene.add(ground);
      this.groundSegments.push(ground);

      // Lane markings
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
      for (let lane = 0; lane < 2; lane++) {
        const lineGeo = new THREE.BoxGeometry(0.08, 0.01, GROUND_SEGMENT_LENGTH);
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.position.set(
          LANES[lane] + LANE_WIDTH / 2,
          -0.69,
          -i * GROUND_SEGMENT_LENGTH + 10
        );
        this.scene.add(line);
        this.decorations.push(line);
      }
    }

    // Side barriers (decorative)
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
    for (let side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        const barrierGeo = new THREE.BoxGeometry(0.3, 0.6, GROUND_SEGMENT_LENGTH);
        const barrier = new THREE.Mesh(barrierGeo, barrierMat);
        barrier.position.set(
          side * (LANE_WIDTH * 1.5 + 1.3),
          -0.5,
          -i * GROUND_SEGMENT_LENGTH + 10
        );
        barrier.castShadow = true;
        this.scene.add(barrier);
        this.decorations.push(barrier);
      }
    }
  }

  _createPlayer() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(PLAYER_SIZE.w, PLAYER_SIZE.h * 0.6, PLAYER_SIZE.d);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x43a047, metalness: 0.1, roughness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = PLAYER_SIZE.h * 0.3;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc80, metalness: 0.0, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = PLAYER_SIZE.h * 0.7 + 0.1;
    head.castShadow = true;
    group.add(head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    for (let side of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(side * 0.12, PLAYER_SIZE.h * 0.7 + 0.15, 0.28);
      group.add(eye);
    }

    // Legs (animated)
    const legGeo = new THREE.BoxGeometry(0.25, PLAYER_SIZE.h * 0.35, 0.25);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.2, -PLAYER_SIZE.h * 0.05, 0);
    this.leftLeg.castShadow = true;
    group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.2, -PLAYER_SIZE.h * 0.05, 0);
    this.rightLeg.castShadow = true;
    group.add(this.rightLeg);

    group.position.set(LANES[this.currentLane], 0, 0);
    this.scene.add(group);
    this.player = group;

    // Running animation for legs
    this._animateLegs();
  }

  _animateLegs() {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(this.leftLeg.rotation, { x: 0.6, duration: 0.2, ease: 'sine.inOut' }, 0);
    tl.to(this.rightLeg.rotation, { x: -0.6, duration: 0.2, ease: 'sine.inOut' }, 0);
    this.legAnimation = tl;
  }

  _createEnvironment() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    this._ambientLight = ambient;

    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 15, 10);
    dirLight.castShadow = true;
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
    this.camera.lookAt(0, 1, -5);
  }

  // ─── Event Handling ─────────────────────────────────────────────────────────

  _addEventListeners() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  _removeEventListeners() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchend', this._onTouchEnd);
  }

  _onKeyDown(e) {
    if (this.gameOver || !this.isRunning) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this._switchLane(-1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        this._switchLane(1);
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this._jump();
        break;
    }
  }

  _onTouchStart(e) {
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  _onTouchEnd(e) {
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
      ease: 'power2.out',
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
      ease: 'power2.out',
    });
    tl.to(this.player.position, {
      y: 0,
      duration: this.config.jumpDuration * 0.55,
      ease: 'power2.in',
    });
  }

  // ─── Spawning ───────────────────────────────────────────────────────────────

  _spawnTrash() {
    const trashType = SPAWNABLE_TRASH[Math.floor(Math.random() * SPAWNABLE_TRASH.length)];
    const lane = Math.floor(Math.random() * 3);

    let mesh;
    switch (trashType.id) {
      case 'plastic_bottle':
        mesh = this._createBottleMesh(trashType.color);
        break;
      case 'can':
        mesh = this._createCanMesh(trashType.color);
        break;
      default:
        mesh = this._createBoxTrashMesh(trashType.color);
        break;
    }

    mesh.position.set(LANES[lane], 0.3, -60);
    mesh.userData = { type: 'trash', trashType, collected: false };
    this.scene.add(mesh);
    this.trashItems.push(mesh);

    // Glow effect
    gsap.to(mesh.rotation, {
      y: Math.PI * 2,
      duration: 2,
      repeat: -1,
      ease: 'none',
    });
  }

  _spawnObstacle() {
    const obsType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const lane = Math.floor(Math.random() * 3);

    const geo = new THREE.BoxGeometry(obsType.w, obsType.h, obsType.d);
    const mat = new THREE.MeshStandardMaterial({
      color: obsType.color,
      roughness: 0.6,
      metalness: 0.1,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(LANES[lane], obsType.h / 2 - 0.7, -60);
    mesh.castShadow = true;
    mesh.userData = { type: 'obstacle', obsType };
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
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 });
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

      const trashBox = new THREE.Box3().setFromObject(trash);
      if (playerBox.intersectsBox(trashBox)) {
        trash.userData.collected = true;
        this.stateManager.addTrash(trash.userData.trashType);

        // Collection animation
        gsap.to(trash.scale, {
          x: 0,
          y: 2,
          z: 0,
          duration: 0.3,
          ease: 'back.in',
          onComplete: () => {
            this.scene.remove(trash);
            this.trashItems.splice(this.trashItems.indexOf(trash), 1);
          },
        });

        // Emit collection event for HUD
        if (this._onTrashCollected) {
          this._onTrashCollected(this.stateManager.getTotalTrashCount());
        }
      }
    }

    // Check obstacle collisions (only if not jumping high enough)
    if (!this.isJumping || this.player.position.y < 1.2) {
      for (const obstacle of this.obstacles) {
        const obsBox = new THREE.Box3().setFromObject(obstacle);
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

    // Stop leg animation
    if (this.legAnimation) this.legAnimation.pause();

    // Hit effect
    gsap.to(this.player.rotation, {
      x: -0.3,
      duration: 0.3,
      ease: 'power2.out',
    });

    // Camera shake
    const origPos = { x: this.camera.position.x, y: this.camera.position.y };
    gsap.to(this.camera.position, {
      x: origPos.x + 0.2,
      y: origPos.y + 0.1,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'none',
      onComplete: () => {
        this.camera.position.x = origPos.x;
        this.camera.position.y = origPos.y;
      },
    });

    // Transition to Stage 2 after delay
    setTimeout(() => {
      this.stateManager.distance = this.distance;
      if (this._onStageComplete) {
        this._onStageComplete();
      }
    }, 1500);
  }

  // ─── Update Loop ────────────────────────────────────────────────────────────

  update(delta) {
    if (!this.isRunning || this.gameOver) return;

    // Increase speed over time (configurable)
    this.speed = Math.min(this.speed + this.config.speedIncrement, this.config.maxSpeed);
    const moveAmount = this.speed * delta;

    // Update distance
    this.distance += moveAmount;
    this.stateManager.distance = this.distance;

    // Check if reached max distance (configurable)
    if (this.distance >= this.config.maxDistance) {
      this.isRunning = false;
      if (this.legAnimation) this.legAnimation.pause();
      this.stateManager.distance = this.distance;
      setTimeout(() => {
        if (this._onStageComplete) this._onStageComplete();
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

    // Move decorations
    for (const dec of this.decorations) {
      dec.position.z += moveAmount;
      if (dec.position.z > GROUND_SEGMENT_LENGTH + 10) {
        dec.position.z -= GROUND_SEGMENT_LENGTH * 6;
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
        this.config.spawnIntervalMin + Math.random() * (this.config.spawnIntervalMax - this.config.spawnIntervalMin);

      // obstacleRatio determines chance of obstacle vs trash
      if (Math.random() >= this.config.obstacleRatio) {
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

    if (this.legAnimation) {
      this.legAnimation.kill();
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
  }
}
