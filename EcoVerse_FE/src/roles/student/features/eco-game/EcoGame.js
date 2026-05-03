/**
 * EcoGame - Main Orchestrator
 *
 * Manages the Three.js renderer, scene, camera, and delegates
 * to the Stage 1 Game (Runner, Sea Rescue, or Grabber) and EcoGameSorter (Stage 2).
 */
import * as THREE from "three";
import EcoGameStateManager, { GameState } from "./EcoGameStateManager";
import EcoGameRunner from "./RunnerTrash/EcoGameRunner";
import EcoGameSorter from "./EcoGameSorter";
import EcoSeaRescue from "./SeaRescue/EcoSeaRescue";
import EcoGrabber from "./EcoGrabber/EcoGrabber";
import { mergeLevelConfig } from "./gameConfig";

export default class EcoGame {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();
    this.stateManager = new EcoGameStateManager();

    this.stage1Game = null;
    this.sorter = null;
    this.activeStage = null;

    this.animationFrameId = null;
    this.container = null;
    this.levelConfig = null;

    // HUD callbacks
    this._hudCallbacks = {};

    this._onResize = this._handleResize.bind(this);
    this._update = this._update.bind(this);
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Initialize the game and attach to a DOM container
   * @param {HTMLElement} container - The DOM element to render into
   * @param {object} levelConfig - Level configuration from API (optional)
   * @param {function} onProgress - Callback for loading progress (0-100)
   * @returns {Promise} Resolves when the game and its initial stage are fully loaded
   */
  async init(container, levelConfig = null, onProgress = null) {
    this.container = container;
    this.levelConfig = levelConfig
      ? mergeLevelConfig(levelConfig)
      : mergeLevelConfig({});
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      5000,
    );

    // Resize listener
    window.addEventListener("resize", this._onResize);

    // Start with Stage 1 directly - wait for it to load
    await this.startStage1(onProgress);

    // Start game loop
    this.clock.start();
    this._update();
  }

  /**
   * Start Stage 1 — chọn game dựa vào levelConfig.stage1Game
   * 'runner'     → EcoGameRunner (endless runner mặc định)
   * 'searescue'  → EcoSeaRescue  (game tàu thu gom rác biển)
   * 'grabber'    → EcoGrabber    (game cần cẩu gắp rác 3D)
   */
  async startStage1(onProgress = null) {
    // Clean up any existing stage
    if (this.sorter) {
      this.sorter.dispose();
      this.sorter = null;
    }

    this.stateManager.setState(GameState.STAGE_1);

    // ── Chọn game Stage 1 theo config ──────────────────────────────────────
    const gameType = this.levelConfig?.stage1Game ?? "runner";

    if (gameType === "searescue") {
      this.stage1Game = new EcoSeaRescue(
        this.scene,
        this.camera,
        this.stateManager,
        this.levelConfig.searescue ?? {},
        this.levelConfig.wasteItems ?? [],
      );
    } else if (gameType === "grabber") {
      this.stage1Game = new EcoGrabber(
        this.scene,
        this.camera,
        this.stateManager,
        this.levelConfig.grabber ?? {},
        this.levelConfig.wasteItems ?? [],
      );
    } else {
      this.stage1Game = new EcoGameRunner(
        this.scene,
        this.camera,
        this.stateManager,
        this.levelConfig.runner,
        this.levelConfig.wasteItems ?? [],
        this.levelConfig.runner?.itemCount || 20,
      );
    }

    await this.stage1Game.init(onProgress);
    this.activeStage = this.stage1Game;

    // Register callbacks — Both Stage 1 games share the same interface
    this.stage1Game.onTrashCollected((trashInfo) => {
      // trashInfo is the full object from RecycleGameLogic.js
      this.stateManager.addTrash(trashInfo);

      if (this._hudCallbacks.onTrashCollected) {
        // Many HUDs expect the total count
        this._hudCallbacks.onTrashCollected(
          this.stateManager.getTotalTrashCount(),
        );
      }
    });

    this.stage1Game.onDistanceUpdate((distance, speed) => {
      if (this._hudCallbacks.onDistanceUpdate) {
        this._hudCallbacks.onDistanceUpdate(distance, speed);
      }
    });

    this.stage1Game.onStageComplete((reason, recycledCount) => {
      const gameType = this.levelConfig?.stage1Game ?? "runner";

      let totalTrash = 12;
      let reqPercent = 80;

      if (gameType === "searescue") {
        const seaConfig = this.levelConfig.searescue || {};
        totalTrash = seaConfig.totalTrash || 12;
        reqPercent = seaConfig.requiredPercentage || 80;
      } else if (gameType === "grabber") {
        const grabConfig = this.levelConfig.grabber || {};
        totalTrash = grabConfig.totalTrash || 10;
        reqPercent = grabConfig.requiredPercentage || 60;
      } else {
        const runnerConfig = this.levelConfig.runner || {};
        totalTrash = runnerConfig.itemCount || 20;
        reqPercent = 80; // Enforced 80% for runner as requested
      }

      const percentage =
        totalTrash > 0 ? (recycledCount / totalTrash) * 100 : 0;

      // SUCCESS: Hit the win target OR collected >= required %
      // Either game type can "timeout" and still win if they collected enough
      const isWin =
        (reason === "win" || reason === "timeout") && percentage >= reqPercent;

      if (isWin) {
        this.switchToStage2();
      } else {
        // FAILURE: Show result screen with failure message
        let failMessage = "";

        if (reason === "death") {
          failMessage =
            gameType === "searescue"
              ? "Thuyền bị hỏng! Bạn cần thu thập ít nhất " +
              reqPercent +
              "% rác."
              : gameType === "grabber"
                ? "Cần cẩu bị hỏng! Bạn cần gắp ít nhất " +
                reqPercent +
                "% rác."
                : "Bạn đã va chạm! Bạn cần nhặt đủ ít nhất " +
                reqPercent +
                "% rác để tiếp tục.";
        } else if (reason === "timeout") {
          failMessage =
            gameType === "searescue"
              ? `Hết giờ! Bạn mới thu gom được ${Math.round(percentage)}%, cần đạt ${reqPercent}% để tiếp tục.`
              : gameType === "grabber"
                ? `Hết giờ! Bạn mới gắp được ${Math.round(percentage)}% rác, cần đạt ${reqPercent}% để tiếp tục.`
                : "Bạn buộc phải nhặt đủ rác trong thời gian quy định tại stage 1 để qua màn phân loại.";
        } else {
          failMessage = `Bạn mới thu gom được ${Math.round(percentage)}%, cần đạt ${reqPercent}% để tiếp tục!`;
        }

        this._showResult(
          { correct: 0, wrong: 0 },
          {
            success: false,
            apiResult: {
              feedbackMessage: failMessage,
              totalItems: totalTrash,
              correctItems: recycledCount,
              accuracyPercentage: Math.round(percentage),
              timeTakenSeconds: this.levelConfig?.searescue?.gameTime || 0,
              coinAwarded: 0,
            },
          },
        );
      }
    });
  }

  /**
   * Transition from Stage 1 to Stage 2
   */
  async switchToStage2() {
    if (this._hudCallbacks.onStageLoading) {
      this._hudCallbacks.onStageLoading(true, 0, "Đang tải màn phân loại...");
    }

    if (this._hudCallbacks.onStageChange) {
      this._hudCallbacks.onStageChange(GameState.STAGE_2);
    }

    // Dispose Stage 1 game
    if (this.stage1Game) {
      this.stage1Game.dispose();
      this.stage1Game = null;
    }

    await this.startStage2((prog) => {
      if (this._hudCallbacks.onStageLoading) {
        this._hudCallbacks.onStageLoading(true, prog, "Đang chuẩn bị rác...");
      }
    });

    if (this._hudCallbacks.onStageLoading) {
      this._hudCallbacks.onStageLoading(false, 1, "Bắt đầu!");
    }
  }

  /**
   * Start Stage 2 - Sorting Game
   */
  async startStage2(onProgress = null) {
    this.stateManager.setState(GameState.STAGE_2);

    this.sorter = new EcoGameSorter(
      this.scene,
      this.camera,
      this.stateManager,
      this.renderer,
      this.levelConfig.sorter,
      this.levelConfig,
    );

    // Register callbacks BEFORE init so initial updates propagate
    this.sorter.onScoreUpdate((score, remaining) => {
      if (this._hudCallbacks.onSortingUpdate) {
        this._hudCallbacks.onSortingUpdate(score, remaining);
      }
    });

    this.sorter.onTimerUpdate((timeRemaining) => {
      if (this._hudCallbacks.onTimerUpdate) {
        this._hudCallbacks.onTimerUpdate(timeRemaining);
      }
    });

    this.sorter.onStageComplete((score) => {
      this._showResult(score);
    });

    await this.sorter.init(onProgress);
    this.activeStage = this.sorter;
  }

  _showResult(score, extra = {}) {
    this.stateManager.setState(GameState.RESULT);
    this.activeStage = null;

    if (this._hudCallbacks.onResult) {
      this._hudCallbacks.onResult({
        distance: this.stateManager.distance,
        trashCollected: this.stateManager.getTotalTrashCount(),
        collectedTrash: this.stateManager.collectedTrash,
        sortingScore: score,
        ...extra,
      });
    }

    if (this._hudCallbacks.onStageChange) {
      this._hudCallbacks.onStageChange(GameState.RESULT);
    }
  }

  /**
   * Restart the entire game
   */
  restart() {
    if (this.stage1Game) {
      this.stage1Game.dispose();
      this.stage1Game = null;
    }
    if (this.sorter) {
      this.sorter.dispose();
      this.sorter = null;
    }

    // Clear scene completely
    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      this.scene.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    }

    // Reset state
    this.stateManager.reset();
    this.clock.start();

    // Start fresh
    this.startStage1();
  }

  // ─── HUD Callback Registration ─────────────────────────────────────────────

  onTrashCollected(cb) {
    this._hudCallbacks.onTrashCollected = cb;
  }
  onDistanceUpdate(cb) {
    this._hudCallbacks.onDistanceUpdate = cb;
  }
  onSortingUpdate(cb) {
    this._hudCallbacks.onSortingUpdate = cb;
  }
  onTimerUpdate(cb) {
    this._hudCallbacks.onTimerUpdate = cb;
  }
  onStageChange(cb) {
    this._hudCallbacks.onStageChange = cb;
  }
  onResult(cb) {
    this._hudCallbacks.onResult = cb;
  }
  onStageLoading(cb) {
    this._hudCallbacks.onStageLoading = cb;
  }

  /** Get the current level config */
  getLevelConfig() {
    return this.levelConfig;
  }

  /**
   * Public method for EcoSeaRescueHUD to trigger Stage 2 transition
   * (switchToStage2 is internal — this exposes it safely)
   */
  triggerStage2() {
    this.switchToStage2();
  }

  // ─── Game Loop ──────────────────────────────────────────────────────────────

  _update() {
    this.animationFrameId = requestAnimationFrame(this._update);

    const delta = this.clock.getDelta();
    const clampedDelta = Math.min(delta, 0.05);

    if (this.activeStage) {
      this.activeStage.update(clampedDelta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  // ─── Resize ─────────────────────────────────────────────────────────────────

  _handleResize() {
    if (!this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener("resize", this._onResize);

    if (this.stage1Game) {
      this.stage1Game.dispose();
      this.stage1Game = null;
    }
    if (this.sorter) {
      this.sorter.dispose();
      this.sorter = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (
        this.container &&
        this.renderer.domElement.parentNode === this.container
      ) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }

    if (this.scene) {
      while (this.scene.children.length > 0) {
        const child = this.scene.children[0];
        this.scene.remove(child);
      }
      this.scene = null;
    }

    this.camera = null;
    this.container = null;
  }
}
