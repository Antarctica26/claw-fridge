"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_GIT_CONFIG, normalizeGitConfig, withUpdatedGitConfigTimestamp } from "@/lib/git-config";
import { initFridgeConfig, testGitConnection } from "@/lib/git-client";
// import { createEncryptedPersistStorage } from "@/lib/secure-storage";
import type {
  AppState,
  GitConfigInitResult,
  GitConfigTestResult,
  GitRepositoryConfig,
  Integration,
} from "@/types";

interface PersistedAppState {
  projectName: string;
  gitConfig: GitRepositoryConfig;
}

const defaultIntegrations: Integration[] = [
  "Next.js",
  "Tailwind CSS",
  "ESLint",
  "Zustand",
  "isomorphic-git",
  "Git Config",
];

const defaultState = {
  projectName: "Claw-Fridge",
  initializedAt: new Date("2026-03-11T15:34:00+08:00").toISOString(),
  integrations: defaultIntegrations,
  gitConfig: DEFAULT_GIT_CONFIG,
  hasHydrated: false,
  lastGitTestResult: null as GitConfigTestResult | null,
  lastGitInitResult: null as GitConfigInitResult | null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultState,
      setProjectName: (projectName) => set({ projectName }),
      setHydrated: (hasHydrated) => set({ hasHydrated }),
      saveGitConfig: (gitConfig) => {
        set({
          gitConfig: withUpdatedGitConfigTimestamp(gitConfig),
          lastGitTestResult: null,
          lastGitInitResult: null,
        });
      },
      testGitConfig: async (gitConfig) => {
        const result = await testGitConnection(normalizeGitConfig(gitConfig));
        set({ lastGitTestResult: result });
        return result;
      },
      initializeFridgeConfig: async (gitConfig) => {
        const result = await initFridgeConfig(normalizeGitConfig(gitConfig));
        set({ lastGitInitResult: result });
        return result;
      },
      clearGitTestResult: () => set({ lastGitTestResult: null }),
      clearGitInitResult: () => set({ lastGitInitResult: null }),
    }),
    {
      name: "claw-fridge-app-store",
      // 自定义 storage，处理旧的加密数据
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch {
            // 旧的加密数据无法解析，直接清理
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        projectName: state.projectName,
        gitConfig: state.gitConfig,
      }) as AppState,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<PersistedAppState>;

        return {
          ...currentState,
          projectName: typedPersistedState.projectName ?? currentState.projectName,
          gitConfig: typedPersistedState.gitConfig
            ? normalizeGitConfig(typedPersistedState.gitConfig)
            : currentState.gitConfig,
        };
      },
    },
  ),
);
