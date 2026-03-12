"use client";

import { useState } from "react";
import { fridgeConfigBranch } from "@/lib/fridge-config.constants";
import { useAppStore } from "@/store/app-store";

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "未保存";
  }

  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function ResultDetails({ details, label = "查看细节" }: { details: string; label?: string }) {
  return (
    <details className="mt-3 rounded-xl bg-black/5 p-3 text-xs leading-5 text-current dark:bg-black/20">
      <summary className="cursor-pointer font-medium">{label}</summary>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{details}</pre>
    </details>
  );
}

export function FridgeInitPanel() {
  const gitConfig = useAppStore((state) => state.gitConfig);
  const lastGitTestResult = useAppStore((state) => state.lastGitTestResult);
  const lastGitInitResult = useAppStore((state) => state.lastGitInitResult);
  const initializeFridgeConfig = useAppStore((state) => state.initializeFridgeConfig);
  const [isInitializing, setIsInitializing] = useState(false);

  const canInitialize = Boolean(gitConfig.repository.trim()) && !isInitializing;
  const actionLabel = lastGitTestResult?.hasFridgeConfig ? `载入 ${fridgeConfigBranch}` : `初始化 ${fridgeConfigBranch}`;

  async function handleInitialize() {
    if (!canInitialize) {
      return;
    }

    setIsInitializing(true);

    try {
      await initializeFridgeConfig(gitConfig);
    } finally {
      setIsInitializing(false);
    }
  }

  return (
    <section className="fridge-panel grid gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <span className="fridge-kicker">Step 2</span>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50 sm:text-3xl">
              初始化冰箱配置
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
              Git 已配置好。现在只差把 <code>{fridgeConfigBranch}</code> 准备好，完成后就会自动进入冰盒列表。
            </p>
          </div>
        </div>

        <button type="button" onClick={() => void handleInitialize()} disabled={!canInitialize} className="fridge-button-primary">
          {isInitializing ? `${actionLabel}中...` : actionLabel}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="fridge-panel-muted grid gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">当前仓库</p>
          <p className="break-all font-mono text-xs text-zinc-700 dark:text-zinc-200">{gitConfig.repository}</p>
          <p>上次保存：{formatDateTime(gitConfig.updatedAt)}</p>
          <p>
            如果这个仓库里已经有 <code>{fridgeConfigBranch}</code>，这里会直接载入；没有的话就自动初始化。
          </p>
        </div>

        <div className="fridge-panel-muted grid gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">接下来会发生什么</p>
          <p>1. 检查并准备配置分支</p>
          <p>2. 写入或保留 fridge-config 文件</p>
          <p>3. 完成后自动进入冰盒列表</p>
        </div>
      </div>

      {lastGitInitResult ? (
        <div className={["fridge-state", lastGitInitResult.ok ? "fridge-state--success" : "fridge-state--error"].join(" ")}>
          <div className="flex items-center justify-between gap-3">
            <strong>{lastGitInitResult.ok ? "初始化完成" : "初始化失败"}</strong>
            <span className="text-xs opacity-80">{formatDateTime(lastGitInitResult.initializedAt)}</span>
          </div>
          <p className="mt-2">{lastGitInitResult.message}</p>
          {lastGitInitResult.branch ? <p className="mt-2">目标分支：{lastGitInitResult.branch}</p> : null}
          {lastGitInitResult.commit ? <p className="mt-2">提交：{lastGitInitResult.commit}</p> : null}
          {lastGitInitResult.details ? <ResultDetails details={lastGitInitResult.details} /> : null}
        </div>
      ) : null}
    </section>
  );
}
