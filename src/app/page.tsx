"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { mysteryMansion } from "@/data/mysteryMansion";
import type { Game, Scene, Ending, HistoryEntry, CompletedAchievement, Achievement } from "@/types/game";

const GAME_DATA: Game = mysteryMansion;

function findScene(game: Game, sceneId: string): Scene | undefined {
  return game.scenes.find((s) => s.sceneId === sceneId);
}

function findEnding(game: Game, endingId: string): Ending | undefined {
  return game.endings.find((e) => e.endingId === endingId);
}

function findAchievement(game: Game, achievementId: string): Achievement | undefined {
  return game.achievements.find((a) => a.achievementId === achievementId);
}

const endingTypeLabel: Record<string, { label: string; color: string }> = {
  good: { label: "好结局", color: "text-amber-300" },
  bad: { label: "坏结局", color: "text-red-400" },
  neutral: { label: "中性结局", color: "text-zinc-400" },
  secret: { label: "隐藏结局", color: "text-purple-400" },
};

export default function Home() {
  const {
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
  } = useGame();

  const [fadeIn, setFadeIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Register game data for achievement checking
  useEffect(() => {
    setGameData(GAME_DATA);
  }, [setGameData]);

  const currentScene = useMemo(
    () => (state.currentScene ? findScene(GAME_DATA, state.currentScene) : undefined),
    [state.currentScene]
  );

  const currentEnding = useMemo(
    () => (state.currentEnding ? findEnding(GAME_DATA, state.currentEnding) : undefined),
    [state.currentEnding]
  );

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(t);
  }, [state.currentScene, state.currentEnding]);

  // Auto-dismiss achievement notification
  useEffect(() => {
    if (lastUnlockedAchievement) {
      const t = setTimeout(dismissAchievement, 4000);
      return () => clearTimeout(t);
    }
  }, [lastUnlockedAchievement, dismissAchievement]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (canUndo) undoChoice();
        return;
      }
      if (!currentScene || currentEnding) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= currentScene.choices.length) {
        makeChoice(currentScene.choices[num - 1], currentScene.sceneId);
      }
    },
    [currentScene, currentEnding, makeChoice, canUndo, undoChoice]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleStart = useCallback(() => {
    startGame(GAME_DATA.gameId, GAME_DATA.scenes[0].sceneId);
  }, [startGame]);

  const handleRestart = useCallback(() => {
    resetGame();
    startGame(GAME_DATA.gameId, GAME_DATA.scenes[0].sceneId);
  }, [resetGame, startGame]);

  const handleBackToTitle = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Title screen
  if (!state.gameId) {
    return <TitleScreen hasSave={hasSave} onStart={handleStart} onReset={resetGame} />;
  }

  // Ending screen
  if (currentEnding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
        <div className={`max-w-2xl w-full text-center transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
          <div className="mb-6 text-sm tracking-[0.3em] text-zinc-600">结局</div>
          <h1 className="text-4xl font-bold mb-3">{currentEnding.title}</h1>
          <div className={`text-sm mb-8 ${endingTypeLabel[currentEnding.type]?.color ?? "text-zinc-400"}`}>
            {endingTypeLabel[currentEnding.type]?.label}
          </div>
          <div className="border-t border-zinc-800 pt-8 max-w-lg mx-auto">
            <p className="text-lg leading-loose text-zinc-300">{currentEnding.description}</p>
          </div>

          {/* Achievements earned this playthrough */}
          {state.completedAchievements.length > 0 && (
            <div className="mt-8 border-t border-zinc-800 pt-6">
              <div className="text-xs text-zinc-600 tracking-wider mb-4">本次达成的成就</div>
              <div className="flex flex-wrap justify-center gap-2">
                {state.completedAchievements.map((ca) => {
                  const ach = findAchievement(GAME_DATA, ca.achievementId);
                  if (!ach) return null;
                  return (
                    <div
                      key={ca.achievementId}
                      className="px-3 py-1.5 rounded-full border border-amber-900/40 bg-amber-950/30 text-amber-300 text-xs"
                    >
                      {ach.title}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-12 space-y-3">
            <p className="text-sm text-zinc-600 mb-6">
              收集 {state.clues.length} 条线索 / 持有 {state.inventory.length} 件道具 / 做出 {state.choiceHistory.length} 次选择
            </p>
            <button
              onClick={handleRestart}
              className="px-10 py-3 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors"
            >
              重新开始
            </button>
            <br />
            {canUndo && (
              <button
                onClick={undoChoice}
                className="px-10 py-3 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
              >
                撤销最后选择
              </button>
            )}
            <br />
            <button
              onClick={handleBackToTitle}
              className="px-10 py-3 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
            >
              返回标题
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scene screen
  if (currentScene) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-500 tracking-wide">{GAME_DATA.title}</div>
            <button
              onClick={undoChoice}
              disabled={!canUndo}
              className={`p-1 rounded transition-colors ${canUndo ? "text-zinc-500 hover:text-zinc-200" : "text-zinc-800 cursor-not-allowed"}`}
              aria-label="撤销上一步"
              title="撤销上一步选择 (Ctrl+Z)"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 7h7a4 4 0 010 8H7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 4L3 7l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-3 text-xs text-zinc-600">
              <span>道具 {state.inventory.length}</span>
              <span className="text-zinc-800">|</span>
              <span>线索 {state.clues.length}</span>
              <span className="text-zinc-800">|</span>
              <span>选择 {state.choiceHistory.length}</span>
              <span className="text-zinc-800">|</span>
              <span>成就 {state.completedAchievements.length}/{GAME_DATA.achievements.length}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-zinc-500 hover:text-zinc-300 p-1"
              aria-label="切换侧栏"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
            <button
              onClick={handleBackToTitle}
              className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              返回标题
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          <main className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
            <div className={`max-w-2xl mx-auto w-full flex-1 flex flex-col transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
              <div className="text-xs text-zinc-700 mb-2 tracking-widest uppercase">
                {currentScene.name}
              </div>
              <div className="w-8 h-px bg-zinc-800 mb-6" />
              <p className="text-lg leading-loose text-zinc-300 mb-12 flex-1">{currentScene.description}</p>

              <div className="space-y-3 pb-8">
                <div className="text-xs text-zinc-700 mb-3 tracking-wider">你的选择</div>
                {currentScene.choices.map((choice, i) => (
                  <button
                    key={choice.choiceId}
                    onClick={() => makeChoice(choice, currentScene.sceneId)}
                    className="w-full text-left px-5 py-4 rounded-lg border border-zinc-800/60 bg-zinc-900/50 hover:bg-zinc-800/70 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-zinc-700 mt-0.5 text-xs font-mono w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="text-zinc-200 group-hover:text-white transition-colors">{choice.text}</div>
                      </div>
                    </div>
                  </button>
                ))}
                <div className="flex gap-4 text-xs text-zinc-800 mt-4">
                  <span>按数字键快速选择</span>
                  {canUndo && <span>Ctrl+Z 撤销</span>}
                </div>
              </div>
            </div>
          </main>

          {/* Desktop sidebar */}
          <aside className="hidden md:flex w-72 border-l border-zinc-800/60 flex-col overflow-y-auto shrink-0">
            <Sidebar
              operationHistory={state.operationHistory}
              onRollback={rollbackTo}
              inventory={state.inventory}
              clues={state.clues}
              relationships={state.relationships}
              completedAchievements={state.completedAchievements}
              gameData={GAME_DATA}
            />
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <aside className="w-72 bg-zinc-950 border-l border-zinc-800/60 overflow-y-auto">
                <div className="flex justify-end p-3">
                  <button onClick={() => setSidebarOpen(false)} className="text-zinc-500 hover:text-zinc-300 p-1" aria-label="关闭侧栏">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 5l10 10M15 5L5 15" />
                    </svg>
                  </button>
                </div>
                <Sidebar
                  operationHistory={state.operationHistory}
                  onRollback={rollbackTo}
                  inventory={state.inventory}
                  clues={state.clues}
                  relationships={state.relationships}
                  completedAchievements={state.completedAchievements}
                  gameData={GAME_DATA}
                />
              </aside>
            </div>
          )}
        </div>

        {/* Achievement unlock notification */}
        {lastUnlockedAchievement && (
          <AchievementNotification
            achievement={lastUnlockedAchievement}
            gameData={GAME_DATA}
            onDismiss={dismissAchievement}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">
      <p>场景未找到</p>
    </div>
  );
}

function AchievementNotification({
  achievement,
  gameData,
  onDismiss,
}: {
  achievement: CompletedAchievement;
  gameData: Game;
  onDismiss: () => void;
}) {
  const ach = findAchievement(gameData, achievement.achievementId);
  if (!ach) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-zinc-900 border border-amber-800/50 rounded-lg px-4 py-3 shadow-lg shadow-amber-900/20 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="text-amber-400 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M9 1l2.1 4.3L16 5.8l-3.5 3.4.8 4.8L9 11.8 4.7 14l.8-4.8L2 5.8l4.9-.5L9 1z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-amber-400/70 tracking-wider mb-0.5">成就解锁</div>
            <div className="text-sm text-zinc-100 font-medium">{ach.title}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{ach.description}</div>
          </div>
          <button onClick={onDismiss} className="text-zinc-600 hover:text-zinc-400 shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function TitleScreen({ hasSave, onStart, onReset }: { hasSave: boolean; onStart: () => void; onReset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-md text-center">
        <div className="text-xs tracking-[0.4em] text-zinc-700 mb-8 uppercase">文字探险游戏</div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">{GAME_DATA.title}</h1>
        <div className="w-12 h-px bg-zinc-700 mx-auto mb-6" />
        <div className="flex items-center justify-center gap-3 text-sm text-zinc-500 mb-6">
          <span>{GAME_DATA.genre}</span>
          <span className="text-zinc-800">/</span>
          <span>{GAME_DATA.worldSetting.era}</span>
          <span className="text-zinc-800">/</span>
          <span>{GAME_DATA.worldSetting.location}</span>
        </div>
        <p className="text-zinc-400 leading-relaxed mb-3">{GAME_DATA.worldSetting.coreConflict}</p>
        <p className="text-sm text-zinc-600 mb-12">
          {GAME_DATA.characters.protagonist.name} — {GAME_DATA.characters.protagonist.identity}
        </p>

        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={onStart}
            className="w-64 px-8 py-3 rounded-lg bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors"
          >
            开始游戏
          </button>
          {hasSave && (
            <button
              onClick={() => { onReset(); onStart(); }}
              className="w-64 px-8 py-3 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
            >
              新游戏（覆盖存档）
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  operationHistory,
  onRollback,
  inventory,
  clues,
  relationships,
  completedAchievements,
  gameData,
}: {
  operationHistory: HistoryEntry[];
  onRollback: (index: number) => void;
  inventory: string[];
  clues: string[];
  relationships: Record<string, number>;
  completedAchievements: CompletedAchievement[];
  gameData: Game;
}) {
  return (
    <div className="p-4 space-y-6 text-sm">
      <HistoryPanel operationHistory={operationHistory} onRollback={onRollback} />
      <AchievementPanel completedAchievements={completedAchievements} gameData={gameData} />
      <Section title="道具" items={inventory} emptyText="暂无道具" />
      <Section title="线索" items={clues} emptyText="暂无线索" />
      <Relationships relationships={relationships} />
    </div>
  );
}

function AchievementPanel({
  completedAchievements,
  gameData,
}: {
  completedAchievements: CompletedAchievement[];
  gameData: Game;
}) {
  const unlockedIds = new Set(completedAchievements.map((a) => a.achievementId));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-3">
        成就 {completedAchievements.length}/{gameData.achievements.filter((a) => !a.hidden || unlockedIds.has(a.achievementId)).length}
      </h3>
      <ul className="space-y-1.5">
        {gameData.achievements.map((ach) => {
          const isUnlocked = unlockedIds.has(ach.achievementId);
          // Hide hidden achievements that aren't unlocked
          if (ach.hidden && !isUnlocked) return null;

          const completed = completedAchievements.find((ca) => ca.achievementId === ach.achievementId);
          const isExpanded = expandedId === ach.achievementId;

          return (
            <li key={ach.achievementId}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : ach.achievementId)}
                className={`w-full text-left pl-3 border-l py-0.5 text-xs transition-colors ${
                  isUnlocked
                    ? "border-amber-700 text-amber-300 hover:text-amber-200"
                    : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isUnlocked ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="shrink-0">
                      <path d="M5 0.5l1.2 2.4 2.7.4-2 1.9.5 2.7L5 6.7 2.6 7.9l.5-2.7-2-1.9 2.7-.4L5 0.5z" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-zinc-700 shrink-0">
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
                    </svg>
                  )}
                  <span>{isUnlocked ? ach.title : "???"}</span>
                </div>
              </button>
              {isExpanded && (
                <div className="ml-3 pl-3 border-l border-zinc-800 mt-0.5 mb-1">
                  <p className="text-xs text-zinc-500 py-0.5">{ach.description}</p>
                  {completed && (
                    <p className="text-xs text-zinc-700 py-0.5">
                      来源：{completed.source.description}
                      <br />
                      <span className="text-zinc-800">
                        「{completed.source.choiceText}」({completed.source.sceneId})
                      </span>
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HistoryPanel({
  operationHistory,
  onRollback,
}: {
  operationHistory: HistoryEntry[];
  onRollback: (index: number) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-3">操作历史</h3>
      {operationHistory.length === 0 ? (
        <p className="text-zinc-800 text-xs">暂无操作记录</p>
      ) : (
        <ul className="space-y-1">
          {operationHistory.map((entry, i) => (
            <li key={i}>
              <button
                onClick={() => onRollback(i)}
                className="w-full text-left pl-3 border-l border-zinc-800 hover:border-zinc-500 hover:text-zinc-100 transition-colors text-xs text-zinc-500 py-0.5"
                title="回退至此选择之前的状态"
              >
                <span className="text-zinc-700 mr-1">#{i + 1}</span>
                {entry.choiceText}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-zinc-800 text-xs">{emptyText}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-zinc-300 pl-3 border-l border-zinc-800">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Relationships({ relationships }: { relationships: Record<string, number> }) {
  const entries = Object.entries(relationships);
  return (
    <div>
      <h3 className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-3">关系</h3>
      {entries.length === 0 ? (
        <p className="text-zinc-800 text-xs">暂无关系</p>
      ) : (
        <div className="space-y-2.5">
          {entries.map(([name, value]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="text-zinc-400 w-14 truncate text-xs">{name}</span>
              <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(5, (value / 5) * 100))}%`,
                    backgroundColor: value > 0 ? "#a3e635" : value < 0 ? "#ef4444" : "#52525b",
                  }}
                />
              </div>
              <span className="text-xs text-zinc-600 w-6 text-right">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
