"use client";

export function Footer() {
  const commitHash = process.env.NEXT_PUBLIC_GIT_COMMIT_HASH || "unknown";

  return (
    <footer className="border-t border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Claw-Fridge</span>
          <a
            href={`https://github.com/Antarctica26/claw-fridge/commit/${commitHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            v.{commitHash}
          </a>
        </div>
      </div>
    </footer>
  );
}
