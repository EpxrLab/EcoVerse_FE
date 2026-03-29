/**
 * ecoGame.service.js - API Service for Game Level Configuration
 *
 * Fetches game level configs from the backend.
 * Currently uses mock data; replace API_BASE_URL and remove mocks
 * when the real endpoints are ready.
 *
 * Expected API endpoints:
 *   GET /api/campaigns/:campaignId/game-levels     → list of levels for a campaign
 *   GET /api/game-levels/:levelId                  → single level config
 */
import { mergeLevelConfig, DIFFICULTY_PRESETS } from "../gameConfig";

// ─── Config ──────────────────────────────────────────────────────────────────

// TODO: Replace with your actual API base URL from environment config
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// ─── Mock Data (remove when real API is ready) ────────────────────────────────

const MOCK_GAME_LEVELS = [
  {
    id: "level_1",
    name: "Khởi đầu",
    difficulty: "easy",
    itemsCount: 10,
    coinReward: 15,
    maxStars: 3,
    stars: 3,
    completed: true,
    locked: false,
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
    sorter: { timeLimit: 0, penaltyOnWrong: false },
  },
  {
    id: "level_2",
    name: "Thử thách",
    difficulty: "easy",
    itemsCount: 15,
    coinReward: 15,
    maxStars: 3,
    stars: 2,
    completed: true,
    locked: false,
    runner: {
      baseSpeed: 10,
      maxSpeed: 22,
      speedIncrement: 0.003,
      maxDistance: 250,
      spawnIntervalMin: 0.7,
      spawnIntervalMax: 1.5,
      obstacleRatio: 0.3,
      jumpHeight: 2.6,
      jumpDuration: 0.55,
    },
    sorter: { timeLimit: 0, penaltyOnWrong: false },
  },
  {
    id: "level_3",
    name: "Tiến bộ",
    difficulty: "medium",
    itemsCount: 20,
    coinReward: 25,
    maxStars: 3,
    stars: 3,
    completed: true,
    locked: false,
    runner: {
      baseSpeed: 12,
      maxSpeed: 28,
      speedIncrement: 0.004,
      maxDistance: 300,
      spawnIntervalMin: 0.6,
      spawnIntervalMax: 1.4,
      obstacleRatio: 0.4,
      jumpHeight: 2.5,
      jumpDuration: 0.55,
    },
    sorter: { timeLimit: 60, penaltyOnWrong: false },
  },
  {
    id: "level_4",
    name: "Chuyên gia",
    difficulty: "medium",
    itemsCount: 25,
    coinReward: 25,
    maxStars: 3,
    stars: 0,
    completed: false,
    locked: false,
    runner: {
      baseSpeed: 14,
      maxSpeed: 30,
      speedIncrement: 0.005,
      maxDistance: 350,
      spawnIntervalMin: 0.5,
      spawnIntervalMax: 1.2,
      obstacleRatio: 0.45,
      jumpHeight: 2.4,
      jumpDuration: 0.5,
    },
    sorter: { timeLimit: 50, penaltyOnWrong: false },
  },
  {
    id: "level_5",
    name: "Bậc thầy",
    difficulty: "hard",
    itemsCount: 30,
    coinReward: 35,
    maxStars: 3,
    stars: 0,
    completed: false,
    locked: false,
    runner: {
      baseSpeed: 16,
      maxSpeed: 35,
      speedIncrement: 0.008,
      maxDistance: 2000,
      spawnIntervalMin: 0.35,
      spawnIntervalMax: 0.9,
      obstacleRatio: 0.55,
      jumpHeight: 2.2,
      jumpDuration: 0.45,
    },
    sorter: { timeLimit: 45, penaltyOnWrong: true },
  },
  {
    id: "level_6",
    name: "Huyền thoại",
    difficulty: "hard",
    itemsCount: 40,
    coinReward: 50,
    maxStars: 3,
    stars: 0,
    completed: false,
    locked: true,
    runner: {
      baseSpeed: 18,
      maxSpeed: 40,
      speedIncrement: 0.01,
      maxDistance: 500,
      spawnIntervalMin: 0.25,
      spawnIntervalMax: 0.7,
      obstacleRatio: 0.6,
      jumpHeight: 2.0,
      jumpDuration: 0.4,
    },
    sorter: { timeLimit: 30, penaltyOnWrong: true },
  },
  {
    id: "level_sea_1",
    name: "Giải cứu đại dương",
    difficulty: "medium",
    stage1Game: "searescue", // ← KEY FIELD
    searescue: {
      gameTime: 60,
      totalTrash: 12,
      maxHp: 10,
    },
    sorter: { timeLimit: 60, penaltyOnWrong: false },
    coinReward: 30,
    maxStars: 3,
    stars: 0,
    completed: false,
    locked: false,
  },
];

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch all game levels available for a campaign.
 * The levels are configured by Admin and selected by School/Partnership.
 *
 * @param {string} campaignId - The campaign ID
 * @returns {Promise<Array>} Array of game level objects (with full config)
 *
 * TODO: Replace mock implementation with real API call:
 *   const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/game-levels`);
 *   const data = await response.json();
 *   return data.map(level => mergeLevelConfig(level));
 */
export async function fetchGameLevels(campaignId) {
  // ── Mock implementation (remove when API is ready) ──
  await new Promise((resolve) => setTimeout(resolve, 500)); // simulate latency
  return MOCK_GAME_LEVELS.map((level) => mergeLevelConfig(level));
}

/**
 * Fetch a single game level config by its ID.
 *
 * @param {string} levelId - The level ID
 * @returns {Promise<object>} Merged game level config
 *
 * TODO: Replace mock implementation with real API call:
 *   const response = await fetch(`${API_BASE_URL}/game-levels/${levelId}`);
 *   const data = await response.json();
 *   return mergeLevelConfig(data);
 */
export async function fetchGameLevelById(levelId) {
  // ── Mock implementation (remove when API is ready) ──
  await new Promise((resolve) => setTimeout(resolve, 300)); // simulate latency
  const level = MOCK_GAME_LEVELS.find((l) => l.id === levelId);
  if (!level) {
    // Fallback: return medium difficulty if level not found
    return mergeLevelConfig({ id: levelId, difficulty: "medium" });
  }
  return mergeLevelConfig(level);
}

/**
 * Submit game results to the backend.
 *
 * @param {string} campaignId - The campaign ID
 * @param {string} levelId - The level ID played
 * @param {object} result - Game result data { distance, trashCollected, sortingScore, ... }
 * @returns {Promise<object>} Server response (rewards earned, new stars, etc.)
 *
 * TODO: Implement when API is ready:
 *   const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/game-results`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ levelId, ...result }),
 *   });
 *   return response.json();
 */
export async function submitGameResult(campaignId, levelId, result) {
  // ── Mock implementation ──
  console.log("[EcoGame] Submitting result:", { campaignId, levelId, result });
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { success: true, coinsEarned: 15, starsEarned: 2 };
}
