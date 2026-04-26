import { describe, it, expect } from "vitest";
import { gameReducer, initialState } from "@/context/GameContext";
import type { GameState, Choice } from "@/types/game";

function makeChoice(overrides: Partial<Choice> = {}): Choice {
  return {
    choiceId: "choice_test",
    text: "测试选项",
    consequence: "测试后果",
    nextScene: "scene_002",
    stateChanges: {},
    ...overrides,
  };
}

function startGame(state: GameState = initialState): GameState {
  return gameReducer(state, { type: "START_GAME", gameId: "game_001", firstScene: "scene_001" });
}

function applyChoice(state: GameState, choice: Choice): GameState {
  return gameReducer(state, { type: "MAKE_CHOICE", choice, sceneId: state.currentScene });
}

const startedState = startGame();

describe("gameReducer - operationHistory", () => {
  it("MAKE_CHOICE pushes snapshot to operationHistory", () => {
    const choice = makeChoice({ choiceId: "c1", text: "选项A" });
    const next = applyChoice(startedState, choice);

    expect(next.operationHistory).toHaveLength(1);
    expect(next.operationHistory[0].choiceId).toBe("c1");
    expect(next.operationHistory[0].choiceText).toBe("选项A");
    expect(next.operationHistory[0].sceneId).toBe("scene_001");
    expect(next.operationHistory[0].snapshot.currentScene).toBe("scene_001");
    expect(next.operationHistory[0].snapshot.inventory).toEqual([]);
  });

  it("UNDO_CHOICE restores previous state", () => {
    const choice1 = makeChoice({ choiceId: "c1", nextScene: "scene_002", stateChanges: { items: ["钥匙"] } });
    const afterChoice = applyChoice(startedState, choice1);
    expect(afterChoice.currentScene).toBe("scene_002");
    expect(afterChoice.inventory).toEqual(["钥匙"]);

    const afterUndo = gameReducer(afterChoice, { type: "UNDO_CHOICE" });
    expect(afterUndo.currentScene).toBe("scene_001");
    expect(afterUndo.inventory).toEqual([]);
    expect(afterUndo.clues).toEqual([]);
  });

  it("UNDO_CHOICE truncates history", () => {
    const c1 = makeChoice({ choiceId: "c1", nextScene: "scene_002" });
    const c2 = makeChoice({ choiceId: "c2", nextScene: "scene_003" });
    const c3 = makeChoice({ choiceId: "c3", nextScene: "scene_004" });

    const s1 = applyChoice(startedState, c1);
    const s2 = applyChoice(s1, c2);
    const s3 = applyChoice(s2, c3);
    expect(s3.operationHistory).toHaveLength(3);

    const afterUndo = gameReducer(s3, { type: "UNDO_CHOICE" });
    expect(afterUndo.operationHistory).toHaveLength(2);
  });

  it("UNDO_CHOICE on empty history is no-op", () => {
    const result = gameReducer(startedState, { type: "UNDO_CHOICE" });
    expect(result).toBe(startedState);
  });

  it("ROLLBACK_TO restores correct snapshot", () => {
    const c1 = makeChoice({ choiceId: "c1", nextScene: "scene_002", stateChanges: { items: ["钥匙"] } });
    const c2 = makeChoice({ choiceId: "c2", nextScene: "scene_003", stateChanges: { clues: ["线索1"] } });
    const c3 = makeChoice({ choiceId: "c3", nextScene: "scene_004", stateChanges: { items: ["手稿"] } });

    const s1 = applyChoice(startedState, c1);
    const s2 = applyChoice(s1, c2);
    const s3 = applyChoice(s2, c3);

    // Rollback to index 0 (before c1 was applied) => state should be startedState
    const rolled = gameReducer(s3, { type: "ROLLBACK_TO", targetIndex: 0 });
    expect(rolled.currentScene).toBe("scene_001");
    expect(rolled.inventory).toEqual([]);
    expect(rolled.clues).toEqual([]);
  });

  it("ROLLBACK_TO truncates future history", () => {
    const c1 = makeChoice({ choiceId: "c1", nextScene: "scene_002" });
    const c2 = makeChoice({ choiceId: "c2", nextScene: "scene_003" });
    const c3 = makeChoice({ choiceId: "c3", nextScene: "scene_004" });

    const s1 = applyChoice(startedState, c1);
    const s2 = applyChoice(s1, c2);
    const s3 = applyChoice(s2, c3);

    const rolled = gameReducer(s3, { type: "ROLLBACK_TO", targetIndex: 1 });
    expect(rolled.operationHistory).toHaveLength(1);
    // The snapshot at index 1 is the state after c1 (before c2 was applied)
    expect(rolled.currentScene).toBe("scene_002");
  });

  it("ROLLBACK_TO with invalid index is no-op", () => {
    const c1 = makeChoice({ choiceId: "c1", nextScene: "scene_002" });
    const s1 = applyChoice(startedState, c1);

    expect(gameReducer(s1, { type: "ROLLBACK_TO", targetIndex: -1 })).toBe(s1);
    expect(gameReducer(s1, { type: "ROLLBACK_TO", targetIndex: 5 })).toBe(s1);
  });

  it("START_GAME clears operationHistory", () => {
    const c1 = makeChoice({ choiceId: "c1", nextScene: "scene_002" });
    const s1 = applyChoice(startedState, c1);
    expect(s1.operationHistory.length).toBeGreaterThan(0);

    const fresh = startGame(s1);
    expect(fresh.operationHistory).toEqual([]);
  });

  it("RESET_GAME clears operationHistory", () => {
    const c1 = makeChoice({ choiceId: "c1", nextScene: "scene_002" });
    const s1 = applyChoice(startedState, c1);
    const reset = gameReducer(s1, { type: "RESET_GAME" });
    expect(reset.operationHistory).toEqual([]);
  });

  it("LOAD_GAME handles missing operationHistory (backward compat)", () => {
    const legacyState = {
      gameId: "game_001",
      currentScene: "scene_001",
      inventory: ["钥匙"],
      clues: [],
      relationships: {},
      choiceHistory: [],
      currentEnding: null,
    } as GameState;

    const loaded = gameReducer(initialState, { type: "LOAD_GAME", state: legacyState });
    expect(loaded.operationHistory).toEqual([]);
    expect(loaded.inventory).toEqual(["钥匙"]);
  });

  it("Rollback from ending clears currentEnding", () => {
    const c1 = makeChoice({ choiceId: "c1", nextScene: "scene_002" });
    const c2 = makeChoice({ choiceId: "c2", nextScene: "ending_bad" });

    const s1 = applyChoice(startedState, c1);
    const s2 = applyChoice(s1, c2);
    expect(s2.currentEnding).toBe("ending_bad");

    const afterUndo = gameReducer(s2, { type: "UNDO_CHOICE" });
    expect(afterUndo.currentEnding).toBeNull();
    expect(afterUndo.currentScene).toBe("scene_002");
  });

  it("Multiple undo/new-choice cycles maintain state consistency", () => {
    // Make choice A
    const cA = makeChoice({ choiceId: "cA", nextScene: "scene_002", stateChanges: { items: ["钥匙"] } });
    const sA = applyChoice(startedState, cA);
    expect(sA.currentScene).toBe("scene_002");
    expect(sA.inventory).toEqual(["钥匙"]);

    // Undo choice A
    const afterUndo1 = gameReducer(sA, { type: "UNDO_CHOICE" });
    expect(afterUndo1.currentScene).toBe("scene_001");
    expect(afterUndo1.inventory).toEqual([]);
    expect(afterUndo1.operationHistory).toHaveLength(0);

    // Make different choice B
    const cB = makeChoice({ choiceId: "cB", nextScene: "scene_003", stateChanges: { clues: ["线索B"] } });
    const sB = applyChoice(afterUndo1, cB);
    expect(sB.currentScene).toBe("scene_003");
    expect(sB.clues).toEqual(["线索B"]);
    expect(sB.inventory).toEqual([]);
    expect(sB.operationHistory).toHaveLength(1);
    expect(sB.operationHistory[0].choiceId).toBe("cB");

    // Undo choice B
    const afterUndo2 = gameReducer(sB, { type: "UNDO_CHOICE" });
    expect(afterUndo2.currentScene).toBe("scene_001");
    expect(afterUndo2.clues).toEqual([]);
    expect(afterUndo2.operationHistory).toHaveLength(0);
  });
});
