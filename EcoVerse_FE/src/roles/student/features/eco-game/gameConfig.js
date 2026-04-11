/**
 * gameConfig.js - Game Level Configuration Defaults & Presets
 *
 * Defines the schema for game level configuration that can be
 * overridden by API data from Admin/School/Partnership.
 *
 * Flow: Admin creates levels → School/Partnership assigns to campaign
 *       → Student fetches config via API → Game uses config
 */

// ─── Default Level Config ─────────────────────────────────────────────────────

export const DEFAULT_LEVEL_CONFIG = {
  id: "default",
  name: "Mặc định",
  difficulty: "medium",

  // API session data
  sessionId: null,
  scorePerCorrect: 0,
  wasteItems: [], // Array of { wasteItemId, itemName, wasteCategory, subCategoryCode, imageUrl, preloadedModel }
  itemCount: 0,
  lives: 0,

  // Stage 1 - Runner or Sea Rescue configuration
  runner: {
    baseSpeed: 12, // Starting speed (units/second)
    maxSpeed: 28, // Maximum attainable speed
    speedIncrement: 0.004, // Speed increase per frame
    maxDistance: 300, // Distance before auto-ending stage 1
    spawnIntervalMin: 0.6, // Minimum seconds between object spawns
    spawnIntervalMax: 1.4, // Maximum seconds between object spawns
    obstacleRatio: 0.4, // 0-1, percentage of spawns that are obstacles
    jumpHeight: 2.5, // Player jump height
    jumpDuration: 0.55, // Jump animation duration (seconds)
  },

  searescue: {
    gameTime: 60,
    totalTrash: 12,
    maxHp: 5,
  },

  // Stage 2 - Sorter configuration
  sorter: {
    timeLimit: 0, // 0 = no time limit, otherwise seconds
    penaltyOnWrong: false, // If true, wrong sort subtracts from score
  },

  // Rewards
  coinReward: 15,
  maxStars: 3,
};

// ─── Difficulty Presets ───────────────────────────────────────────────────────
// These serve as local fallbacks and templates for the Admin UI

export const DIFFICULTY_PRESETS = {
  easy: {
    difficulty: "easy",
    runner: {
      baseSpeed: 8,
      maxSpeed: 18,
      speedIncrement: 0.002,
      maxDistance: 200,
      spawnIntervalMin: 0.9,
      spawnIntervalMax: 1.8,
      obstacleRatio: 0.25,
      jumpHeight: 2.8,
      jumpDuration: 0.6,
    },
    sorter: {
      timeLimit: 0,
      penaltyOnWrong: false,
    },
    coinReward: 15,
    maxStars: 3,
  },

  medium: {
    difficulty: "medium",
    runner: {
      baseSpeed: 12,
      maxSpeed: 28,
      speedIncrement: 0.004,
      maxDistance: 2000,
      spawnIntervalMin: 0.6,
      spawnIntervalMax: 1.4,
      obstacleRatio: 0.4,
      jumpHeight: 2.5,
      jumpDuration: 0.55,
    },
    sorter: {
      timeLimit: 60,
      penaltyOnWrong: false,
    },
    coinReward: 25,
    maxStars: 3,
  },

  hard: {
    difficulty: "hard",
    runner: {
      baseSpeed: 16,
      maxSpeed: 35,
      speedIncrement: 0.008,
      maxDistance: 400,
      spawnIntervalMin: 0.35,
      spawnIntervalMax: 0.9,
      obstacleRatio: 0.55,
      jumpHeight: 2.2,
      jumpDuration: 0.45,
    },
    sorter: {
      timeLimit: 45,
      penaltyOnWrong: true,
    },
    coinReward: 50,
    maxStars: 3,
  },
};

// ─── Merge Utility ────────────────────────────────────────────────────────────

/**
 * Deep merge an API-provided level config with the default config.
 * Partial configs are supported — any missing field falls back to default.
 *
 * @param {object} apiConfig - Partial or full config from the API
 * @returns {object} Complete merged config
 */
export function mergeLevelConfig(apiConfig = {}) {
  // If API provides a difficulty preset name but no detailed runner/sorter config,
  // use the preset as the base
  const presetKey = apiConfig.difficulty || DEFAULT_LEVEL_CONFIG.difficulty;
  const preset = DIFFICULTY_PRESETS[presetKey] || DIFFICULTY_PRESETS.medium;

  return {
    ...DEFAULT_LEVEL_CONFIG,
    ...preset,
    ...apiConfig,
    // Preserve wasteItems from API as-is (contains preloaded THREE.js objects)
    wasteItems: apiConfig.wasteItems || DEFAULT_LEVEL_CONFIG.wasteItems,
    runner: {
      ...DEFAULT_LEVEL_CONFIG.runner,
      ...preset.runner,
      ...(apiConfig.runner || {}),
    },
    searescue: {
      ...DEFAULT_LEVEL_CONFIG.searescue,
      ...(apiConfig.searescue || {}),
    },
    sorter: {
      ...DEFAULT_LEVEL_CONFIG.sorter,
      ...preset.sorter,
      ...(apiConfig.sorter || {}),
    },
  };
}
