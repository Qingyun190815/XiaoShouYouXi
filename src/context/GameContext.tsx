"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import type { GameState, GameAction, Choice, HistoryEntry, CompletedAchievement, Achievement, Game } from "@/types/game";

const STORAGE_KEY = "text_adventure_save";
const ACHIEVEMENTS_KEY = "text_adventure_achievements";

export const initialState: GameState = {
  gameId: "",
  currentScene: "",
  inventory: [],
  clues: [],
  relationships: {},
  choiceHistory: [],
  currentEnding: null,
  operationHistory: [],
  completedAchievements: [],
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        gameId: action.gameId,
        currentScene: action.firstScene,
        inventory: [],
        clues: [],
        relationships: {},
        choiceHistory: [],
        currentEnding: null,
        operationHistory: [],
        completedAchievements: [],
      };

    case "MAKE_CHOICE": {
      const { choice, sceneId } = action;

      const historyEntry: HistoryEntry = {
        snapshot: {
          gameId: state.gameId,
          currentScene: state.currentScene,
          inventory: state.inventory,
          clues: state.clues,
          relationships: state.relationships,
          choiceHistory: state.choiceHistory,
          currentEnding: state.currentEnding,
          completedAchievements: state.completedAchievements,
        },
        sceneId,
        choiceId: choice.choiceId,
        choiceText: choice.text,
        timestamp: Date.now(),
      };

      const newInventory = choice.stateChanges.items
        ? [...state.inventory, ...choice.stateChanges.items]
        : state.inventory;

      const newClues = choice.stateChanges.clues
        ? [...state.clues, ...choice.stateChanges.clues]
        : state.clues;

      const newRelationships = choice.stateChanges.relationships
        ? Object.entries(choice.stateChanges.relationships).reduce(
            (acc, [key, val]) => ({
              ...acc,
              [key]: (state.relationships[key] || 0) + val,
            }),
            state.relationships
          )
        : state.relationships;

      const isEnding = choice.nextScene.startsWith("ending_");

      return {
        ...state,
        currentScene: choice.nextScene,
        inventory: newInventory,
        clues: newClues,
        relationships: newRelationships,
        choiceHistory: [
          ...state.choiceHistory,
          { sceneId, choiceId: choice.choiceId, timestamp: Date.now() },
        ],
        currentEnding: isEnding ? choice.nextScene : null,
        operationHistory: [...state.operationHistory, historyEntry],
      };
    }

    case "UNDO_CHOICE": {
      if (state.operationHistory.length === 0) return state;
      const lastEntry = state.operationHistory[state.operationHistory.length - 1];
      return {
        ...lastEntry.snapshot,
        operationHistory: state.operationHistory.slice(0, -1),
      };
    }

    case "ROLLBACK_TO": {
      const { targetIndex } = action;
      if (targetIndex < 0 || targetIndex >= state.operationHistory.length) return state;
      const targetEntry = state.operationHistory[targetIndex];
      return {
        ...targetEntry.snapshot,
        operationHistory: state.operationHistory.slice(0, targetIndex),
      };
    }

    case "RESET_GAME":
      return initialState;

    case "LOAD_GAME":
      return {
        ...action.state,
        operationHistory: action.state.operationHistory ?? [],
        completedAchievements: action.state.completedAchievements ?? [],
      };

    case "UNLOCK_ACHIEVEMENT": {
      const exists = state.completedAchievements.some(
        (a) => a.achievementId === action.achievement.achievementId
      );
      if (exists) return state;
      return {
        ...state,
        completedAchievements: [...state.completedAchievements, action.achievement],
      };
    }

    default:
      return state;
  }
}

function checkAchievementCondition(
  achievement: Achievement,
  state: GameState,
  sceneId: string,
  choiceId: string
): boolean {
  const { condition } = achievement;
  switch (condition.type) {
    case "ending_reached":
      return state.currentEnding === condition.endingId;
    case "item_acquired":
      return state.inventory.includes(condition.item);
    case "clue_found":
      return state.clues.includes(condition.clue);
    case "relationship_threshold":
      return (state.relationships[condition.npc] || 0) >= condition.min;
    case "all_endings": {
      const allEndingsKey = `${state.gameId}_all_endings`;
      try {
        const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
        const reachedEndings: Record<string, string[]> = raw ? JSON.parse(raw) : {};
        const ended = reachedEndings[allEndingsKey] || [];
        return condition.endingIds.every((id) => ended.includes(id));
      } catch {
        return false;
      }
    }
    case "choice_made":
      return sceneId === condition.sceneId && choiceId === condition.choiceId;
    default:
      return false;
  }
}

function buildAchievementSource(
  achievement: Achievement,
  sceneId: string,
  choiceId: string,
  choiceText: string
): CompletedAchievement["source"] {
  const { condition } = achievement;
  switch (condition.type) {
    case "ending_reached":
      return { sceneId, choiceId, choiceText, description: `达成了结局「${achievement.title}」` };
    case "item_acquired":
      return { sceneId, choiceId, choiceText, description: `获得了道具「${condition.item}」` };
    case "clue_found":
      return { sceneId, choiceId, choiceText, description: `发现了线索「${condition.clue}」` };
    case "relationship_threshold":
      return { sceneId, choiceId, choiceText, description: `与${condition.npc}的关系达到了${condition.min}` };
    case "all_endings":
      return { sceneId, choiceId, choiceText, description: "达成了所有结局" };
    case "choice_made":
      return { sceneId, choiceId, choiceText, description: `做出了关键选择「${choiceText}」` };
    default:
      return { sceneId, choiceId, choiceText, description: achievement.title };
  }
}

interface GameContextValue {
  state: GameState;
  startGame: (gameId: string, firstScene: string) => void;
  makeChoice: (choice: Choice, sceneId: string) => void;
  resetGame: () => void;
  hasSave: boolean;
  canUndo: boolean;
  undoChoice: () => void;
  rollbackTo: (targetIndex: number) => void;
  setGameData: (game: Game) => void;
  lastUnlockedAchievement: CompletedAchievement | null;
  dismissAchievement: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<CompletedAchievement | null>(null);
  const gameDataRef = { current: null as Game | null };

  const setGameData = useCallback((game: Game) => {
    gameDataRef.current = game;
  }, []);

  const checkAndUnlockAchievements = useCallback(
    (newState: GameState, sceneId: string, choiceId: string, choiceText: string) => {
      const game = gameDataRef.current;
      if (!game) return;

      const unlockedIds = new Set(newState.completedAchievements.map((a) => a.achievementId));

      // Track reached endings for "all_endings" achievement
      if (newState.currentEnding) {
        try {
          const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
          const reachedEndings: Record<string, string[]> = raw ? JSON.parse(raw) : {};
          const key = `${newState.gameId}_all_endings`;
          const existing = reachedEndings[key] || [];
          if (!existing.includes(newState.currentEnding)) {
            existing.push(newState.currentEnding);
            reachedEndings[key] = existing;
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(reachedEndings));
          }
        } catch {}
      }

      for (const achievement of game.achievements) {
        if (unlockedIds.has(achievement.achievementId)) continue;
        if (checkAchievementCondition(achievement, newState, sceneId, choiceId)) {
          const completed: CompletedAchievement = {
            achievementId: achievement.achievementId,
            unlockedAt: Date.now(),
            source: buildAchievementSource(achievement, sceneId, choiceId, choiceText),
          };
          dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement: completed });
          setLastUnlockedAchievement(completed);
        }
      }
    },
    []
  );

  const startGame = useCallback(
    (gameId: string, firstScene: string) => {
      dispatch({ type: "START_GAME", gameId, firstScene });
    },
    []
  );

  const makeChoice = useCallback(
    (choice: Choice, sceneId: string) => {
      dispatch({ type: "MAKE_CHOICE", choice, sceneId });

      const game = gameDataRef.current;
      if (game) {
        const newInventory = choice.stateChanges.items
          ? [...state.inventory, ...choice.stateChanges.items]
          : state.inventory;
        const newClues = choice.stateChanges.clues
          ? [...state.clues, ...choice.stateChanges.clues]
          : state.clues;
        const newRelationships = choice.stateChanges.relationships
          ? Object.entries(choice.stateChanges.relationships).reduce(
              (acc, [key, val]) => ({ ...acc, [key]: (state.relationships[key] || 0) + val }),
              state.relationships
            )
          : state.relationships;
        const isEnding = choice.nextScene.startsWith("ending_");
        const newState: GameState = {
          ...state,
          currentScene: choice.nextScene,
          inventory: newInventory,
          clues: newClues,
          relationships: newRelationships,
          choiceHistory: [...state.choiceHistory, { sceneId, choiceId: choice.choiceId, timestamp: Date.now() }],
          currentEnding: isEnding ? choice.nextScene : null,
          completedAchievements: state.completedAchievements,
        };
        checkAndUnlockAchievements(newState, sceneId, choice.choiceId, choice.text);
      }
    },
    [state, checkAndUnlockAchievements]
  );

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const undoChoice = useCallback(() => {
    dispatch({ type: "UNDO_CHOICE" });
  }, []);

  const rollbackTo = useCallback((targetIndex: number) => {
    dispatch({ type: "ROLLBACK_TO", targetIndex });
  }, []);

  const dismissAchievement = useCallback(() => {
    setLastUnlockedAchievement(null);
  }, []);

  // Load saved game on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        if (parsed.gameId && parsed.currentScene) {
          dispatch({ type: "LOAD_GAME", state: parsed });
        }
      }
    } catch {}
  }, []);

  // Save game state on change
  useEffect(() => {
    if (state.gameId) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state]);

  const hasSave =
    typeof window !== "undefined"
      ? !!localStorage.getItem(STORAGE_KEY)
      : false;

  const canUndo = state.operationHistory.length > 0;

  return (
    <GameContext.Provider
      value={{
        state,
        startGame,
        makeChoice,
        resetGame,
        hasSave,
        canUndo,
        undoChoice,
        rollbackTo,
        setGameData,
        lastUnlockedAchievement,
        dismissAchievement,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
