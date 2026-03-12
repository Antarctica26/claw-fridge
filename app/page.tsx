"use client";

import { FridgeInitPanel } from "@/components/home/fridge-init-panel";
import { GitConfigPanel } from "@/components/home/git-config-panel";
import { IceBoxList } from "@/components/home/ice-box-list";
import { useMounted } from "@/hooks/use-mounted";
import { useAppStore } from "@/store/app-store";

type HomeStep = "git-config" | "fridge-init" | "ice-boxes";

function HomeSkeleton() {
  return (
    <main className="fridge-page">
      <div className="fridge-shell">
        <section className="fridge-hero">
          <div className="relative z-10 grid gap-4">
            <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-200/80 dark:bg-white/10" />
            <div className="h-12 w-full max-w-xl animate-pulse rounded-3xl bg-zinc-200/80 dark:bg-white/10" />
            <div className="h-5 w-full max-w-2xl animate-pulse rounded-full bg-zinc-100 dark:bg-white/5" />
          </div>
        </section>

        <section className="fridge-panel">
          <div className="grid gap-3">
            <div className="h-10 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-100 dark:bg-white/5" />
          </div>
        </section>
      </div>
    </main>
  );
}

function HomeHero({ step }: { step: HomeStep }) {
  const content =
    step === "git-config"
      ? {
          chip: "Step 1 / Git",
          title: "先把 Git 仓库接上。",
          description: "首页只展示当前缺的那一步。先保存 Git 配置，完成后会自动进入下一步。",
          tips: ["填写仓库地址", "保存并测试连接", "完成后自动进入初始化"],
        }
      : step === "fridge-init"
        ? {
            chip: "Step 2 / fridge-config",
            title: "再把 fridge-config 初始化好。",
            description: "Git 已就位，现在只差配置分支。初始化完成后，首页会自动切到冰盒列表。",
            tips: ["准备配置分支", "写入 fridge-config", "完成后进入冰盒列表"],
          }
        : {
            chip: "Ice Boxes",
            title: "冰箱已就绪，直接管理冰盒。",
            description: "当前环境已经不缺前置配置，所以首页只保留冰盒列表。",
            tips: ["查看冰盒状态", "展开详情", "继续备份、恢复和生成 Skill"],
          };

  return (
    <section className="fridge-hero">
      <div className="relative z-10 flex flex-wrap items-center gap-3 text-sm font-medium">
        <span className="fridge-chip fridge-chip--ocean">Home</span>
        <span className="fridge-chip">{content.chip}</span>
      </div>

      <div className="relative z-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-3">
          <p className="fridge-kicker">Claw-Fridge Console</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 sm:text-lg">{content.description}</p>
        </div>

        <div className="fridge-panel-tint relative z-10 grid gap-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
          {content.tips.map((tip) => (
            <p key={tip}>{tip}</p>
          ))}
        </div>
      </div>
    </section>
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
  const step: HomeStep = !hasGitConfig ? "git-config" : hasInitializedFridgeConfig ? "ice-boxes" : "fridge-init";

  return (
    <main className="fridge-page">
      <div className="fridge-shell">
        <HomeHero step={step} />
        {step === "git-config" ? <GitConfigPanel /> : null}
        {step === "fridge-init" ? <FridgeInitPanel /> : null}
        {step === "ice-boxes" ? <IceBoxList /> : null}
      </div>
    </main>
  );
}
