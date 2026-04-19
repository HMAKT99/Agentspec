export function BeforeAfter() {
  return (
    <section className="pb-20">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight">
        Contradictions hide in plain markdown.
      </h2>
      <p className="mb-8 max-w-2xl text-[color:var(--color-fg-muted)]">
        Two rules that look fine in isolation become undefined behavior when the agent sees them
        side by side. mdpact flags the ambiguity the first time you run it.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card label="Before" tone="error">
          {`## Commit discipline

- You must always commit before pushing.
- Never commit before pushing.`}
        </Card>
        <Card label="After" tone="ok">
          {`## Commit discipline

- You must always commit before pushing.
- Unless the branch is a scratch branch,
  in which case pushing without a commit is fine.`}
        </Card>
      </div>
    </section>
  );
}

function Card({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "error" | "ok";
  children: string;
}) {
  const toneStyles =
    tone === "error"
      ? "border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent-soft)]/40"
      : "border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)]";
  return (
    <div className={`rounded-[var(--radius)] border ${toneStyles}`}>
      <div className="border-b border-[color:var(--color-line)] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        {label}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-6 text-[color:var(--color-fg)]">
        <code>{children}</code>
      </pre>
    </div>
  );
}
