"use client";

import { GitConfigPanel } from "@/components/home/git-config-panel";
import { IceBoxList } from "@/components/home/ice-box-list";
import { useMounted } from "@/hooks/use-mounted";
import { useAppStore } from "@/store/app-store";

function HomeSkeleton() {
  return (
    <main className="fridge-page">
      <div className="fridge-shell">
        <section className="fridge-panel">
          <div className="grid gap-3">
            <div className="h-8 w-32 animate-pulse rounded-full bg-zinc-200/80 dark:bg-white/10" />
            <div className="h-10 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  const mounted = useMounted();
  const gitConfig = useAppStore((state) => state.gitConfig);
  const hasInitializedFridgeConfig = useAppStore((state) => state.hasInitializedFridgeConfig);

  if (!mounted) {
    return <HomeSkeleton />;
  }

  const hasGitConfig = Boolean(gitConfig.repository.trim());

  return (
    <main className="fridge-page">
      <div className="fridge-shell">
        {!hasGitConfig || !hasInitializedFridgeConfig ? <GitConfigPanel /> : null}
        {hasGitConfig && hasInitializedFridgeConfig ? <IceBoxList /> : null}
      </div>
    </main>
  );
}
