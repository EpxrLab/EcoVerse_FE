/**
 * EcoGame - Main Orchestrator
 *
 * Manages the Three.js renderer, scene, camera, and delegates
 * to EcoGameRunner (Stage 1) and EcoGameSorter (Stage 2).
 */
import * as THREE from 'three';
import EcoGameStateManager, { GameState } from './EcoGameStateManager';
import EcoGameRunner from './EcoGameRunner';
import EcoGameSorter from './EcoGameSorter';
import { DEFAULT_LEVEL_CONFIG, mergeLevelConfig } from './gameConfig';

export default class EcoGame {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();
    this.stateManager = new EcoGameStateManager();

    this.runner = null;
    this.sorter = null;
    this.activeStage = null;

    this.animationFrameId = null;
    this.container = null;
    this.levelConfig = null; // Stored for restart

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
   */
  init(container, levelConfig = null) {
    this.container = container;
    this.levelConfig = levelConfig ? mergeLevelConfig(levelConfig) : mergeLevelConfig({});

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
      200
    );

    // Resize listener
    window.addEventListener('resize', this._onResize);

    // Start with Stage 1 directly
    this.startStage1();

    // Start game loop
    this.clock.start();
    this._update();
  }

  /**
   * Start Stage 1 - Endless Runner
   */
  startStage1() {
    // Clean up any existing stage
    if (this.sorter) {
      this.sorter.dispose();
      this.sorter = null;
    }

    this.stateManager.setState(GameState.STAGE_1);

    this.runner = new EcoGameRunner(this.scene, this.camera, this.stateManager, this.levelConfig.runner);
    this.runner.init();
    this.activeStage = this.runner;

    // Register callbacks
    this.runner.onTrashCollected((count) => {
      if (this._hudCallbacks.onTrashCollected) {
        this._hudCallbacks.onTrashCollected(count);
      }
    });

    this.runner.onDistanceUpdate((distance, speed) => {
      if (this._hudCallbacks.onDistanceUpdate) {
        this._hudCallbacks.onDistanceUpdate(distance, speed);
      }
    });

    this.runner.onStageComplete(() => {
      this.switchToStage2();
    });
  }

  /**
   * Transition from Stage 1 to Stage 2
   */
  switchToStage2() {
    if (this._hudCallbacks.onStageChange) {
      this._hudCallbacks.onStageChange(GameState.STAGE_2);
    }

    // Dispose runner
    if (this.runner) {
      this.runner.dispose();
      this.runner = null;
    }

    this.startStage2();
  }

  /**
   * Start Stage 2 - Sorting Game
   */
  startStage2() {
    this.stateManager.setState(GameState.STAGE_2);

    this.sorter = new EcoGameSorter(
      this.scene,
      this.camera,
      this.stateManager,
      this.renderer,
      this.levelConfig.sorter
    );
    this.sorter.init();
    this.activeStage = this.sorter;

    // Register callbacks
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
  }

  /**
   * Show result screen
   */
  _showResult(score) {
    this.stateManager.setState(GameState.RESULT);
    this.activeStage = null;

    if (this._hudCallbacks.onResult) {
      this._hudCallbacks.onResult({
        distance: this.stateManager.distance,
        trashCollected: this.stateManager.getTotalTrashCount(),
        collectedTrash: this.stateManager.collectedTrash,
        sortingScore: score,
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
    // Clean up
    if (this.runner) {
      this.runner.dispose();
      this.runner = null;
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

  onTrashCollected(cb) { this._hudCallbacks.onTrashCollected = cb; }
  onDistanceUpdate(cb) { this._hudCallbacks.onDistanceUpdate = cb; }
  onSortingUpdate(cb) { this._hudCallbacks.onSortingUpdate = cb; }
  onTimerUpdate(cb) { this._hudCallbacks.onTimerUpdate = cb; }
  onStageChange(cb) { this._hudCallbacks.onStageChange = cb; }
  onResult(cb) { this._hudCallbacks.onResult = cb; }

  /** Get the current level config */
  getLevelConfig() { return this.levelConfig; }

  // ─── Game Loop ──────────────────────────────────────────────────────────────

  _update() {
    this.animationFrameId = requestAnimationFrame(this._update);

    const delta = this.clock.getDelta();
    const clampedDelta = Math.min(delta, 0.05); // Prevent huge delta spikes

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
    // Stop animation loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove resize listener
    window.removeEventListener('resize', this._onResize);

    // Dispose stages
    if (this.runner) {
      this.runner.dispose();
      this.runner = null;
    }
    if (this.sorter) {
      this.sorter.dispose();
      this.sorter = null;
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }

    // Clear scene
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
