// 文字探险游戏 - 类型定义
// 基于「文字探险游戏技能创建规范」2.2节

export interface WorldSetting {
  era: string;
  location: string;
  factions: string[];
  coreConflict: string;
}

export interface Protagonist {
  name: string;
  identity: string;
  goal: string;
  personality: string;
}

export interface NPC {
  id: string;
  name: string;
  identity: string;
  role: string;
  personality: string;
}

export interface Characters {
  protagonist: Protagonist;
  npcs: NPC[];
}

export interface StateChanges {
  items?: string[];
  clues?: string[];
  relationships?: Record<string, number>;
}

export interface Choice {
  choiceId: string;
  text: string;
  consequence: string;
  nextScene: string;
  stateChanges: StateChanges;
}

export interface Scene {
  sceneId: string;
  name: string;
  description: string;
  choices: Choice[];
}

export interface Ending {
  endingId: string;
  title: string;
  description: string;
  requirements: string[];
  type: "good" | "bad" | "neutral" | "secret";
}

export interface StateSystem {
  inventory: string[];
  clues: string[];
  relationships: Record<string, number>;
}

export interface Game {
  gameId: string;
  title: string;
  genre: string;
  difficulty: string;
  worldSetting: WorldSetting;
  characters: Characters;
  scenes: Scene[];
  endings: Ending[];
  stateSystem: StateSystem;
}

export interface GameState {
  gameId: string;
  currentScene: string;
  inventory: string[];
  clues: string[];
  relationships: Record<string, number>;
  choiceHistory: ChoiceRecord[];
  currentEnding: string | null;
}

export interface ChoiceRecord {
  sceneId: string;
  choiceId: string;
  timestamp: number;
}

export type GameAction =
  | { type: "START_GAME"; gameId: string; firstScene: string }
  | { type: "MAKE_CHOICE"; choice: Choice; sceneId: string }
  | { type: "RESET_GAME" }
  | { type: "LOAD_GAME"; state: GameState };

export interface GenerationParams {
  theme: string;
  genre: string;
  length: "short" | "medium" | "long";
  protagonist?: string;
  specialElements?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
