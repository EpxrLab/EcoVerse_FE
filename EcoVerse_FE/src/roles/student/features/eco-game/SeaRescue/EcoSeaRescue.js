/**
 * EcoSeaRescue - Stage 1 alternative: TPS boat sea rescue game
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
  constructor(scene, camera, stateManager, config = {}) {
    this.scene = scene;
    this.camera = camera;
    this.stateManager = stateManager;

    this.config = {
      gameTime: config.gameTime ?? GAME_TIME,
      totalTrash: config.totalTrash ?? TOTAL_TRASH,
      maxHp: config.maxHp ?? PLAYER_MAX_HP,
    };

    this._gameState = null;
    this._player = null;
    this._playerState = null;

    this._hp = this.config.maxHp;
    this._timeLeft = this.config.gameTime;
    this._timerId = null;
    this._stopped = false;

    // ── Audio ──────────────────────────────────────────────────────────────
    this.audioListener = null;
    this.bgm = null;
    this.collectSound = null;
    this.warningSound = null; // damage / hit
    this.gameOverSound = null;

    // ── HUD reactive setters ───────────────────────────────────────────────
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

    this._onTrashCollected = null;
    this._onDistanceUpdate = null;
    this._onStageComplete = null;
    this._keyDown = null;
    this._keyUp = null;

    // Audio tracking — prevent false-positive collect & spam damage sound
    this._prevInventorySize = 0; // updated each setInventoryCount call
    this._lastDamageSoundTime = 0; // cooldown for damage sfx
  }

  setHudCallbacks(setters) {
    this._hudSetters = { ...this._hudSetters, ...setters };
  }

  setEndGameCallback(cb) {
    this._onEndGame = cb;
  }

  // ─── Audio loader ──────────────────────────────────────────────────────────
  _loadAudio() {
    const audioLoader = new THREE.AudioLoader();

    // BGM — loop
    this.bgm = new THREE.Audio(this.audioListener);
    audioLoader.load(
      "/assets/audio/music_game.mp3",
      (buffer) => {
        this.bgm.setBuffer(buffer);
        this.bgm.setLoop(true);
        this.bgm.setVolume(0.4);
        if (!this._stopped) this.bgm.play();
      },
      undefined,
      () => console.warn("BGM not found"),
    );

    // Collect sound — one-shot khi nhặt rác
    this.collectSound = new THREE.Audio(this.audioListener);
    audioLoader.load("/assets/audio/collect.mp3", (buffer) => {
      this.collectSound.setBuffer(buffer);
      this.collectSound.setVolume(0.6);
    });

    // Warning / hit sound — một-shot khi va chạm vật cản
    this.warningSound = new THREE.Audio(this.audioListener);
    audioLoader.load("/assets/audio/warning.mp3", (buffer) => {
      this.warningSound.setBuffer(buffer);
      this.warningSound.setVolume(0.7);
    });

    // Game-over sound
    this.gameOverSound = new THREE.Audio(this.audioListener);
    audioLoader.load("/assets/audio/gameover.mp3", (buffer) => {
      this.gameOverSound.setBuffer(buffer);
      this.gameOverSound.setVolume(0.8);
    });
  }

  _playOneShot(sound) {
    if (!sound || !sound.buffer) {
      console.warn("Sound not ready:", sound);
      return;
    }

    const ctx = this.audioListener?.context;
    if (!ctx) return;

    const doPlay = () => {
      const s = new THREE.Audio(this.audioListener);
      s.setBuffer(sound.buffer);
      s.setVolume(sound.getVolume());
      s.play();

      // auto cleanup
      setTimeout(() => {
        s.stop();
      }, 1000);
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(doPlay);
    } else {
      doPlay();
    }
  }

  // ─── init() ───────────────────────────────────────────────────────────────
  init() {
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);
    this.camera.fov = 75;
    this.camera.updateProjectionMatrix();

    // AudioListener gắn vào camera — phải làm 1 lần
    if (!this.audioListener) {
      this.audioListener = new THREE.AudioListener();
      this.camera.add(this.audioListener);
    }
    this._loadAudio();

    const storage = initStorage(this.scene);
    const { player, playerState } = initPlayer(this.scene);
    const trash = initTrash(this.scene);
    const obstacles = initObstacles(this.scene);
    const { speedZones, slowZones } = initZones(this.scene, obstacles);

    this._player = player;
    this._playerState = playerState;

    this._gameState = {
      skybox: null,
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

    initWorld(this.scene, this._gameState);

    // Countdown timer
    this._timerId = setInterval(() => {
      this._timeLeft = Math.max(0, this._timeLeft - 1);
      this._hudSetters.setTimeLeft(this._timeLeft);
      if (this._onDistanceUpdate) {
        this._onDistanceUpdate(
          this._gameState.recycledInStorage,
          this._timeLeft,
        );
      }
      if (this._timeLeft <= 0) this._handleComplete("timeout");
    }, 1000);

    // Keyboard — resume AudioContext on first keydown (browser policy)
    const resumeAudio = () => {
      if (this.audioListener?.context?.state === "suspended") {
        this.audioListener.context.resume();
      }
    };

    this._keyDown = (e) => {
      resumeAudio();
      if (this._gameState) this._gameState.keys[e.key.toLowerCase()] = true;
    };
    this._keyUp = (e) => {
      if (this._gameState) this._gameState.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", this._keyDown);
    window.addEventListener("keyup", this._keyUp);
  }

  // ─── update(delta) ────────────────────────────────────────────────────────
  update(delta) {
    if (!this._gameState || this._stopped) return;

    const h = this._hudSetters;

    gameTick({
      state: this._gameState,
      scene: this.scene,
      camera: this.camera,
      renderer: null,
      player: this._player,
      playerState: this._playerState,
      storage: this._gameState.storage,
      clock: { getDelta: () => delta },
      onPickup: () => {
        this._playOneShot(this.collectSound);
      },

      setInventoryCount: (newCount) => {
        this._prevInventorySize = newCount;
        h.setInventoryCount(newCount);
      },

      setInventoryFull: h.setInventoryFull,
      setHudPulse: h.setHudPulse,

      setDamageFlash: (val) => {
        if (val) {
          const now = Date.now();
          if (now - this._lastDamageSoundTime > 500) {
            this._lastDamageSoundTime = now;
            this._playOneShot(this.warningSound);
          }
        }
        h.setDamageFlash(val);
      },

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
        // Lưu ý: gameTick gọi endGame("death") trực tiếp bên trong updaterFn
        // khi hp <= 1, không đi qua nhánh này → death sound xử lý ở endGame bên dưới.
      },

      // ── endGame: intercept tất cả kết thúc game (death + timeout + win) ──
      // Đây là nơi DUY NHẤT phát game-over sound — gameTick gọi endGame("death")
      // trực tiếp từ setHp updater, không qua setHp wrapper ở trên.
      endGame: (reason) => {
        if (reason === "death" || reason === "timeout") {
          // Stop BGM ngay lập tức rồi play gameover sound
          // Phải stop BGM TRƯỚC khi gọi _playOneShot để AudioContext không bị conflict
          if (this.bgm?.isPlaying) this.bgm.stop();
          this._playOneShot(this.gameOverSound);
        }
        this._handleComplete(reason);
      },
    });
  }

  // ─── _handleComplete ──────────────────────────────────────────────────────
  _handleComplete(reason) {
    if (this._stopped) return;
    this._stopped = true;
    if (this._gameState) this._gameState.stopped = true;
    clearInterval(this._timerId);

    // BGM và gameOverSound đã được xử lý trong endGame callback trước khi
    // _handleComplete được gọi — chỉ cần đảm bảo BGM dừng nếu chưa dừng (trường hợp win)
    if (this.bgm?.isPlaying) this.bgm.stop();

    this.stateManager.distance = this._gameState?.recycledInStorage ?? 0;

    if (this._onEndGame) {
      this._onEndGame(reason, this._gameState?.recycledInStorage ?? 0);
    }

    const delay = reason === "win" ? 500 : 1500;
    setTimeout(() => {
      if (this._onStageComplete) this._onStageComplete();
    }, delay);
  }

  // ─── Joystick ─────────────────────────────────────────────────────────────
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

  // ─── Callbacks ────────────────────────────────────────────────────────────
  onTrashCollected(cb) {
    this._onTrashCollected = cb;
  }
  onDistanceUpdate(cb) {
    this._onDistanceUpdate = cb;
  }
  onStageComplete(cb) {
    this._onStageComplete = cb;
  }

  // ─── dispose() ────────────────────────────────────────────────────────────
  dispose() {
    clearInterval(this._timerId);
    if (this._keyDown) window.removeEventListener("keydown", this._keyDown);
    if (this._keyUp) window.removeEventListener("keyup", this._keyUp);
    if (this._gameState) this._gameState.stopped = true;

    // ── Stop & cleanup ALL audio objects ──
    // Nếu còn đang isPlaying thì phải stop() trước khi bỏ reference,
    // nếu không Three.js sẽ throw "cannot disconnect" error.
    [
      this.bgm,
      this.collectSound,
      this.warningSound,
      this.gameOverSound,
    ].forEach((sound) => {
      if (sound?.isPlaying) sound.stop();
    });

    // Gỡ AudioListener khỏi camera
    if (this.audioListener) {
      this.camera.remove(this.audioListener);
      this.audioListener = null;
    }

    this.bgm = null;
    this.collectSound = null;
    this.warningSound = null;
    this.gameOverSound = null;

    this.scene.background = null;
    this.scene.fog = null;

    const toRemove = [
      this._player,
      this._gameState?.storage,
      this._gameState?.skybox,
      this._gameState?.underwaterPlane,
      this._gameState?.oceanModel,
      this._gameState?.fallbackPlane,
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
