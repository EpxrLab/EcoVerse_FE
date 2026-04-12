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
  constructor(scene, camera, stateManager, config = {}, wasteItems = []) {
    this.scene = scene;
    this.camera = camera;
    this.stateManager = stateManager;
    this._wasteItems = wasteItems;

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

  // ─── Audio loader ─────────────────────────────────────────────────────────
  // Dùng THREE.AudioLoader để load buffer vào đúng AudioContext của audioListener.
  // KHÔNG dùng Web Audio API trực tiếp vì buffer được decode bởi ctx của THREE —
  // nếu play trên ctx khác sẽ throw InvalidStateError im lặng.
  _loadAudio() {
    const audioLoader = new THREE.AudioLoader();

    // ── BGM ──
    this.bgm = new THREE.Audio(this.audioListener);
    audioLoader.load(
      "/assets/audio/music_game.mp3",
      (buffer) => {
        if (!this.bgm) return;
        this.bgm.setBuffer(buffer);
        this.bgm.setLoop(true);
        this.bgm.setVolume(0.4);

        // Start playing as soon as context is ready and user has interacted
        const tryPlay = () => {
          if (this._stopped || !this.bgm || this.bgm.isPlaying) return;
          this._resumeThenCall(() => {
            if (!this._stopped && this.bgm && !this.bgm.isPlaying) {
              this.bgm.play();
            }
          });
        };

        tryPlay();
        // Also listen for first interaction if context was suspended
        window.addEventListener("pointerdown", tryPlay, { once: true });
        window.addEventListener("keydown", tryPlay, { once: true });
      },
      undefined,
      () => console.warn("BGM not found: /assets/audio/music_game.mp3"),
    );

    // ── SFX — dùng chung một helper để load ──
    this.collectSound = this._makeSfx(
      audioLoader,
      "/assets/audio/collect.mp3",
      0.75, // Increased volume for cleaner sound
    );
    this.warningSound = this._makeSfx(
      audioLoader,
      "/assets/audio/warning.mp3",
      0.85, // Increased volume for impact
    );
    this.gameOverSound = this._makeSfx(
      audioLoader,
      "/assets/audio/gameover.mp3",
      0.9,
    );
  }

  // Tạo một THREE.Audio, load buffer vào đó, trả về object
  _makeSfx(loader, url, volume) {
    const sfx = new THREE.Audio(this.audioListener);
    loader.load(
      url,
      (buffer) => {
        sfx.setBuffer(buffer);
        sfx.setVolume(volume);
      },
      undefined,
      () => console.warn(`SFX not found: ${url}`),
    );
    return sfx;
  }

  // Resume AudioContext rồi gọi callback — pattern an toàn cho mọi browser
  _resumeThenCall(fn) {
    // THREE.AudioContext là singleton dùng chung — lấy qua audioListener
    const ctx = this.audioListener?.context;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx
        .resume()
        .then(fn)
        .catch(() => {});
    } else {
      fn();
    }
  }

  // ─── _playOneShot ──────────────────────────────────────────────────────────
  // Dùng đúng THREE.Audio object đã load buffer — KHÔNG tạo BufferSource thủ công.
  // Lý do: buffer được decode bởi audioListener.context, phải play trên cùng ctx đó.
  // Nếu tạo BufferSource thủ công từ ctx khác → InvalidStateError bị nuốt im lặng.
  _playOneShot(sfx) {
    if (!sfx?.buffer) return; // buffer chưa load xong
    this._resumeThenCall(() => {
      if (sfx.isPlaying) sfx.stop();
      sfx.play();
    });
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

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(dirLight);

    const storage = initStorage(this.scene);
    const { player, playerState } = initPlayer(this.scene);
    const trash = initTrash(this.scene, this._wasteItems, this.config.totalTrash);
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
      totalTrashCount: this.config.totalTrash,
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
    window.addEventListener("pointerdown", resumeAudio, { once: true });
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

      setInventoryCount: h.setInventoryCount,
      setInventoryFull: h.setInventoryFull,
      setHudPulse: h.setHudPulse,
      setDamageFlash: h.setDamageFlash,

      // ── onPickup: gameTick gọi đúng 1 lần ngay khi nhặt được rác ──────────
      onPickup: () => {
        this._playOneShot(this.collectSound);
      },

      // ── onDamage: gameTick gọi đúng 1 lần khi va chạm vật cản ───────────
      // Đã có OBSTACLE_DAMAGE_COOLDOWN=1000ms trong gameTick nên không cần cooldown thêm.
      onDamage: () => {
        this._playOneShot(this.warningSound);
      },

      setScreenShake: h.setScreenShake,
      setCurrentZone: h.setCurrentZone,

      setRecycledCount: (count) => {
        h.setRecycledCount(count);
        // if (this._onTrashCollected) this._onTrashCollected(count);
      },

      onItemDeposited: (trashType) => {
        if (this._onTrashCollected) this._onTrashCollected(trashType);
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

    const delay = reason === "win" ? 0 : 1500;
    setTimeout(() => {
      if (this._onStageComplete) {
        this._onStageComplete(reason, this._gameState?.recycledInStorage ?? 0);
      }
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

    // ── Stop BGM và SFX ngắn ngay lập tức ──
    // gameOverSound KHÔNG stop — đang phát thì để chạy hết
    [this.bgm, this.collectSound, this.warningSound].forEach((s) => {
      if (s?.isPlaying) s.stop();
    });

    // Gỡ AudioListener sau 3s để gameOverSound kịp phát xong
    // (null ngay để _playOneShot không gọi thêm sau dispose)
    const _listener = this.audioListener;
    const _camera = this.camera;
    this.audioListener = null;
    setTimeout(() => {
      if (_listener) _camera.remove(_listener);
    }, 3000);

    this.bgm = null;
    this.collectSound = null;
    this.warningSound = null;
    this.gameOverSound = null;

    this.scene.background = null;
    this.scene.fog = null;

    const toRemove = [
      this._gameState?.skybox,
      this._gameState?.oceanModel,
      this._gameState?.depthDisc,
      this._gameState?.fallbackPlane,
      this._gameState?.mapRing,
      this._gameState?.storage,
      this._player,
      ...(this._gameState?.buoys ?? []),
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
