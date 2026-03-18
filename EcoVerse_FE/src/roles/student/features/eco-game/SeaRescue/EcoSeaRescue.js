/**
 * EcoSeaRescue - Stage 1 alternative: TPS boat sea rescue game
 *
 * Wraps RecycleGameLogic into a class with the same interface as EcoGameRunner.
 * EcoGame orchestrator calls init(), update(delta), dispose() and listens to
 * onTrashCollected / onDistanceUpdate / onStageComplete — same as EcoGameRunner.
 */
import * as THREE from "three";
import {
  TOTAL_TRASH,
  GAME_TIME,
  PLAYER_MAX_HP,
  REQUIRED_PERCENTAGE,
  isMobileDevice,
  initWorld,
  initStorage,
  initPlayer,
  initTrash,
  initObstacles,
  initZones,
  gameTick,
} from "./RecycleGameLogic";

export default class EcoSeaRescue {
  /**
   * Same constructor signature as EcoGameRunner:
   *   constructor(scene, camera, stateManager, config)
   */
  constructor(scene, camera, stateManager, config = {}) {
    this.scene = scene;
    this.camera = camera;
    this.stateManager = stateManager;

    this.config = {
      gameTime: config.gameTime ?? GAME_TIME,
      totalTrash: config.totalTrash ?? TOTAL_TRASH,
      maxHp: config.maxHp ?? PLAYER_MAX_HP,
    };

    // Internal runtime state
    this._gameState = null;
    this._player = null;
    this._playerState = null;

    this._hp = this.config.maxHp;
    this._timeLeft = this.config.gameTime;
    this._timerId = null;
    this._stopped = false;

    // HUD reactive setters — wired up by EcoSeaRescueHUD via setHudCallbacks()
    this._hudSetters = {
      setInventoryCount: () => {},
      setRecycledCount: () => {},
      setHp: () => {},
      setTimeLeft: () => {},
      setCurrentZone: () => {},
      setInventoryFull: () => {},
      setHudPulse: () => {},
      setDamageFlash: () => {},
      setScreenShake: () => {},
    };

    // Stage callbacks (set by EcoGame)
    this._onTrashCollected = null;
    this._onDistanceUpdate = null;
    this._onStageComplete = null;

    // Keyboard handlers (stored for cleanup)
    this._keyDown = null;
    this._keyUp = null;
  }

  // ─── Called by EcoSeaRescueHUD to wire React state setters ──────────────────
  setHudCallbacks(setters) {
    this._hudSetters = { ...this._hudSetters, ...setters };
  }

  // ─── Called by EcoSeaRescueHUD to receive endGame notification ───────────────
  setEndGameCallback(cb) {
    this._onEndGame = cb;
  }

  // ─── init() — same interface as EcoGameRunner.init() ─────────────────────────
  init() {
    // TPS camera for sea view
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);
    this.camera.fov = 75;
    this.camera.updateProjectionMatrix();

    // Build world
    // ✅ Tạo _gameState TRƯỚC, sau đó truyền vào initWorld(scene, state).
    // initWorld load ocean GLB async — callback gán thẳng state.oceanMixer vào object này.
    // gameTick đọc state.oceanMixer mỗi frame và sẽ thấy giá trị được gán bởi callback.
    const storage = initStorage(this.scene);
    const { player, playerState } = initPlayer(this.scene);
    const trash = initTrash(this.scene);
    const obstacles = initObstacles(this.scene);
    const { speedZones, slowZones } = initZones(this.scene, obstacles);

    this._player = player;
    this._playerState = playerState;

    this._gameState = {
      // ocean fields — sẽ được gán async bởi initWorld callback
      oceanModel: null,
      oceanMixer: null,
      underwaterPlane: null,
      fallbackPlane: null,

      player,
      storage,
      trash,
      obstacles,
      allZones: [...speedZones, ...slowZones],
      speedZones,
      slowZones,
      inventory: [],
      velocity: new THREE.Vector3(),
      angularVelocity: 0,
      keys: {},
      joystick: { x: 0, y: 0 },
      lastDamageTime: 0,
      lastDropTime: 0,
      hitTime: 0,
      stopped: false,
      fallingItems: [],
      scatteredItems: [],
      recycledInStorage: 0,
      speedMultiplier: 1,
      lastInventoryFullWarning: 0,
    };

    // Gọi SAU khi _gameState đã tồn tại — callback gán thẳng state.oceanMixer vào object trên
    initWorld(this.scene, this._gameState);

    // Countdown timer
    this._timerId = setInterval(() => {
      this._timeLeft = Math.max(0, this._timeLeft - 1);

      // Push timeLeft to HUD
      this._hudSetters.setTimeLeft(this._timeLeft);

      // Also reuse onDistanceUpdate so EcoGameHUD can show it if needed
      if (this._onDistanceUpdate) {
        this._onDistanceUpdate(
          this._gameState.recycledInStorage,
          this._timeLeft,
        );
      }

      if (this._timeLeft <= 0) {
        this._handleComplete("timeout");
      }
    }, 1000);

    // Keyboard
    this._keyDown = (e) => {
      if (this._gameState) this._gameState.keys[e.key.toLowerCase()] = true;
    };
    this._keyUp = (e) => {
      if (this._gameState) this._gameState.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", this._keyDown);
    window.addEventListener("keyup", this._keyUp);
  }

  // ─── update(delta) — called every frame by EcoGame._update() ─────────────────
  update(delta) {
    if (!this._gameState || this._stopped) return;

    const h = this._hudSetters;

    gameTick({
      state: this._gameState,
      scene: this.scene,
      camera: this.camera,
      renderer: null, // EcoGame handles renderer.render()
      player: this._player,
      playerState: this._playerState,
      storage: this._gameState.storage,
      clock: { getDelta: () => delta },

      // Wire HUD setters
      setInventoryCount: h.setInventoryCount,
      setInventoryFull: h.setInventoryFull,
      setHudPulse: h.setHudPulse,
      setDamageFlash: h.setDamageFlash,
      setScreenShake: h.setScreenShake,
      setCurrentZone: h.setCurrentZone,

      setRecycledCount: (count) => {
        h.setRecycledCount(count);
        if (this._onTrashCollected) this._onTrashCollected(count);
      },

      setHp: (updaterFn) => {
        const newHp =
          typeof updaterFn === "function" ? updaterFn(this._hp) : updaterFn;
        this._hp = newHp;
        h.setHp(() => newHp);
        if (newHp <= 0) this._handleComplete("death");
      },

      endGame: (reason) => this._handleComplete(reason),
    });
  }

  // ─── _handleComplete — triggers onStageComplete so EcoGame switches to Stage 2 ─
  _handleComplete(reason) {
    if (this._stopped) return;
    this._stopped = true;
    if (this._gameState) this._gameState.stopped = true;
    clearInterval(this._timerId);

    // Write distance equivalent into stateManager for ResultScreen
    this.stateManager.distance = this._gameState?.recycledInStorage ?? 0;

    // Notify HUD to show GameOverScreen
    if (this._onEndGame) {
      this._onEndGame(reason, this._gameState?.recycledInStorage ?? 0);
    }

    // Delay matches EcoGameRunner (1500ms after collision / 500ms after win)
    const delay = reason === "win" ? 500 : 1500;
    setTimeout(() => {
      if (this._onStageComplete) this._onStageComplete();
    }, delay);
  }

  // ─── Joystick (called by EcoSeaRescueHUD touch handlers) ─────────────────────
  setJoystick(x, y) {
    if (this._gameState) {
      this._gameState.joystick.x = x;
      this._gameState.joystick.y = y;
    }
  }

  resetJoystick() {
    if (this._gameState) {
      this._gameState.joystick.x = 0;
      this._gameState.joystick.y = 0;
    }
  }

  // ─── Callbacks — same API as EcoGameRunner ────────────────────────────────────
  onTrashCollected(cb) {
    this._onTrashCollected = cb;
  }
  onDistanceUpdate(cb) {
    this._onDistanceUpdate = cb;
  }
  onStageComplete(cb) {
    this._onStageComplete = cb;
  }

  // ─── dispose() — called by EcoGame when switching to Stage 2 ─────────────────
  dispose() {
    clearInterval(this._timerId);
    if (this._keyDown) window.removeEventListener("keydown", this._keyDown);
    if (this._keyUp) window.removeEventListener("keyup", this._keyUp);
    if (this._gameState) this._gameState.stopped = true;

    // Reset scene appearance so EcoGameSorter starts with a clean slate
    // (EcoGameSorter._createEnvironment() will set its own background/fog)
    this.scene.background = null;
    this.scene.fog = null;

    // Remove Three.js objects from the shared scene
    // — includes ocean world objects tracked in oceanState
    const toRemove = [
      this._player,
      this._gameState?.storage,
      this._gameState?.underwaterPlane, // from initWorld
      this._gameState?.oceanModel, // from initWorld (async, may be null if not loaded yet)
      this._gameState?.fallbackPlane, // from initWorld fallback
      ...(this._gameState?.trash ?? []),
      ...(this._gameState?.obstacles ?? []),
      ...(this._gameState?.allZones ?? []),
      ...(this._gameState?.fallingItems?.map((i) => i.mesh) ?? []),
      ...(this._gameState?.scatteredItems?.map((i) => i.mesh) ?? []),
    ].filter(Boolean);

    toRemove.forEach((obj) => {
      this.scene.remove(obj);
      obj.traverse?.((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material))
            child.material.forEach((m) => m.dispose());
          else child.material.dispose();
        }
      });
    });

    this._gameState = null;
    this._player = null;
    this._playerState = null;
  }
}
