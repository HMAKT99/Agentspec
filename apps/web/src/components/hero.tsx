import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-24 pb-20 sm:pt-32">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2 text-sm text-[color:var(--color-accent)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
          <span className="uppercase tracking-[0.2em]">mdpact v0.1.0 · live</span>
        </div>
        <h1 className="font-display max-w-4xl text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          <span className="text-[color:var(--color-fg)]">The missing layer between your</span>{" "}
          <span className="text-[color:var(--color-accent)]">markdown</span>{" "}
          <span className="text-[color:var(--color-fg)]">and your</span>{" "}
          <span className="text-[color:var(--color-accent)]">agents</span>
          <span className="cursor-blink">▊</span>
        </h1>
        <p className="max-w-2xl text-lg text-[color:var(--color-fg-muted)]">
          <code className="font-mono text-[color:var(--color-accent-hot)]">mdpact</code> lints every
          agent-instruction file you ship —{" "}
          <code className="font-mono text-[color:var(--color-fg)]">CLAUDE.md</code>,{" "}
          <code className="font-mono text-[color:var(--color-fg)]">AGENTS.md</code>,{" "}
          <code className="font-mono text-[color:var(--color-fg)]">
            .github/copilot-instructions.md
          </code>
          , <code className="font-mono text-[color:var(--color-fg)]">.cursorrules</code>, and more.
          Rule catalog, behavior-prediction engine, GitHub Action — all free, OSS, local-first.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/editor"
            className="inline-flex h-11 items-center rounded-[var(--radius)] bg-[color:var(--color-accent)] px-6 text-sm font-medium uppercase tracking-wider text-[color:var(--color-bg)] transition hover:bg-[color:var(--color-accent-hot)]"
          >
            → Try the editor
          </Link>
          <Link
            href="/docs/getting-started"
            className="inline-flex h-11 items-center rounded-[var(--radius)] border border-[color:var(--color-line-strong)] px-6 text-sm font-medium uppercase tracking-wider text-[color:var(--color-fg)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            Docs
          </Link>
          <a
            href="https://github.com/HMAKT99/Agentspec"
            className="inline-flex h-11 items-center rounded-[var(--radius)] border border-[color:var(--color-line-strong)] px-6 text-sm font-medium uppercase tracking-wider text-[color:var(--color-fg)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
