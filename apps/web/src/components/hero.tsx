import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-24 pb-20 sm:pt-32">
      <div className="flex flex-col gap-8">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          The missing layer between your markdown and your agents.
        </h1>
        <p className="max-w-2xl text-lg text-[color:var(--color-fg-muted)]">
          <code className="font-mono text-[color:var(--color-fg)]">mdpact</code> lints the markdown
          your agents read, so you stop shipping contradictions. Rule catalog, behavior-prediction
          engine, GitHub Action — all free, OSS, local-first.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/editor"
            className="inline-flex h-10 items-center rounded-[8px] bg-[color:var(--color-fg)] px-5 text-sm font-medium text-[color:var(--color-bg)] hover:opacity-90"
          >
            Try the editor
          </Link>
          <Link
            href="/docs/getting-started"
            className="inline-flex h-10 items-center rounded-[8px] border border-[color:var(--color-line)] px-5 text-sm font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-alt)]"
          >
            Docs
          </Link>
          <a
            href="https://github.com/HMAKT99/Agentspec"
            className="inline-flex h-10 items-center rounded-[8px] border border-[color:var(--color-line)] px-5 text-sm font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-alt)]"
          >
            GitHub
          </a>
          <span className="font-mono text-sm text-[color:var(--color-fg-subtle)]">
            npm i -D @mdpact/cli
          </span>
        </div>
      </div>
    </section>
  );
}
