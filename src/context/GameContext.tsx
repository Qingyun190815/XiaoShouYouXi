"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { GameState, GameAction, Choice } from "@/types/game";

const STORAGE_KEY = "text_adventure_save";

const initialState: GameState = {
  gameId: "",
  currentScene: "",
  inventory: [],
  clues: [],
  relationships: {},
  choiceHistory: [],
  currentEnding: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
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
      };

    case "MAKE_CHOICE": {
      const { choice, sceneId } = action;
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
      };
    }

    case "RESET_GAME":
      return initialState;

    case "LOAD_GAME":
      return action.state;

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  startGame: (gameId: string, firstScene: string) => void;
  makeChoice: (choice: Choice, sceneId: string) => void;
  resetGame: () => void;
  hasSave: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(
    (gameId: string, firstScene: string) => {
      dispatch({ type: "START_GAME", gameId, firstScene });
    },
    []
  );

  const makeChoice = useCallback((choice: Choice, sceneId: string) => {
    dispatch({ type: "MAKE_CHOICE", choice, sceneId });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
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

  return (
    <GameContext.Provider
      value={{ state, startGame, makeChoice, resetGame, hasSave }}
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
