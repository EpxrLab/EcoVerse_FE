/**
 * EcoGameStateManager
 * Simple finite state machine for managing game states.
 * States: MENU → STAGE_1 → STAGE_2 → RESULT
 */

export const GameState = {
  MENU: 'MENU',
  STAGE_1: 'STAGE_1',
  STAGE_2: 'STAGE_2',
  RESULT: 'RESULT',
};

// Trash types and their sorting categories
export const TrashType = {
  PLASTIC_BOTTLE: { id: 'plastic_bottle', name: 'Chai nhựa', bin: 'recycle', color: 0x2196f3 },
  PAPER: { id: 'paper', name: 'Giấy', bin: 'recycle', color: 0xffffff },
  CAN: { id: 'can', name: 'Vỏ lon', bin: 'recycle', color: 0x9e9e9e },
  BANANA_PEEL: { id: 'banana_peel', name: 'Vỏ chuối', bin: 'organic', color: 0xffeb3b },
  FOOD_WASTE: { id: 'food_waste', name: 'Thức ăn thừa', bin: 'organic', color: 0x8d6e63 },
  BROKEN_GLASS: { id: 'broken_glass', name: 'Mảnh kính', bin: 'inorganic', color: 0x80cbc4 },
  STYROFOAM: { id: 'styrofoam', name: 'Xốp', bin: 'inorganic', color: 0xeceff1 },
};

export const BinType = {
  ORGANIC: { id: 'organic', name: 'Hữu cơ', color: 0x4caf50 },
  INORGANIC: { id: 'inorganic', name: 'Vô cơ', color: 0x757575 },
  RECYCLE: { id: 'recycle', name: 'Tái chế', color: 0x2196f3 },
};

export const DynamicBinTypes = {
  RECYCLABLE: { id: 'recyclable', name: 'Tái chế', color: 0x2196f3 },
  ORGANIC: { id: 'organic', name: 'Hữu cơ', color: 0x4caf50 },
  HAZARDOUS: { id: 'hazardous', name: 'Nguy hại', color: 0xf44336 },
  GENERAL: { id: 'general', name: 'Còn lại', color: 0x757575 },
};

// All spawnable trash types in the runner stage
export const SPAWNABLE_TRASH = [
  TrashType.PLASTIC_BOTTLE,
  TrashType.PAPER,
  TrashType.CAN,
  TrashType.BANANA_PEEL,
  TrashType.FOOD_WASTE,
  TrashType.BROKEN_GLASS,
  TrashType.STYROFOAM,
];

export default class EcoGameStateManager {
  constructor() {
    this.currentState = GameState.MENU;
    this.listeners = {};
    this.collectedTrash = []; // Array of { type: TrashType, count: number }
    this.sortingScore = { correct: 0, wrong: 0 };
    this.distance = 0;
  }

  /**
   * Register a callback for a state transition
   * @param {string} state - The GameState to listen for
   * @param {Function} callback - Callback invoked when entering this state
   */
  on(state, callback) {
    if (!this.listeners[state]) {
      this.listeners[state] = [];
    }
    this.listeners[state].push(callback);
  }

  /**
   * Transition to a new state
   * @param {string} newState - The target GameState
   */
  setState(newState) {
    const oldState = this.currentState;
    this.currentState = newState;

    if (this.listeners[newState]) {
      this.listeners[newState].forEach((cb) => cb({ from: oldState, to: newState, manager: this }));
    }

    // Notify generic 'change' listeners
    if (this.listeners['change']) {
      this.listeners['change'].forEach((cb) => cb({ from: oldState, to: newState, manager: this }));
    }
  }

  /**
   * Add collected trash from Stage 1
   * @param {object} trashType - A TrashType object
   */
  addTrash(trashType) {
    const existing = this.collectedTrash.find((t) => t.type.id === trashType.id);
    if (existing) {
      existing.count++;
    } else {
      this.collectedTrash.push({ type: trashType, count: 1 });
    }
  }

  /**
   * Get total count of all collected trash
   */
  getTotalTrashCount() {
    return this.collectedTrash.reduce((sum, t) => sum + t.count, 0);
  }

  /**
   * Get a flat array of individual trash items for Stage 2
   */
  getTrashItemsForSorting() {
    const items = [];
    this.collectedTrash.forEach((entry) => {
      for (let i = 0; i < entry.count; i++) {
        items.push({ ...entry.type });
      }
    });
    return items;
  }

  /**
   * Reset all game data for a new round
   */
  reset() {
    this.collectedTrash = [];
    this.sortingScore = { correct: 0, wrong: 0 };
    this.distance = 0;
    this.currentState = GameState.MENU;
  }
}
