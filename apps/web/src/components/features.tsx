interface Feature {
  title: string;
  body: string;
  tag: string;
  coming?: boolean;
}

const features: Feature[] = [
  {
    title: "Lint",
    body: "18+ rules spanning conflict detection, clarity heuristics, tool policy, compliance, and token budgets.",
    tag: "mdpact lint",
  },
  {
    title: "Test",
    body: "Behavior-prediction engine runs tasks across Anthropic, OpenAI, and Google models with a USD budget guardrail.",
    tag: "mdpact test",
  },
  {
    title: "Score",
    body: "A single 0–100 score your PR comment can delta against the base branch, with deductions you can audit.",
    tag: "mdpact score",
  },
  {
    title: "CI",
    body: "GitHub Action posts a sticky PR comment, inline annotations, and fails the check if the score drops.",
    tag: "GitHub Action",
  },
  {
    title: "Fix",
    body: "Safe-by-default auto-fixes with a --unsafe opt-in for transformational rewrites.",
    tag: "mdpact fix",
  },
  {
    title: "Registry",
    body: "Shared rule and test catalogs across teams. Paid, hosted.",
    tag: "coming soon",
    coming: true,
  },
];

export function Features() {
  return (
    <section className="pb-16">
      <h2 className="font-display mb-8 text-4xl font-normal tracking-tight text-[color:var(--color-fg)]">
        Everything the CLI does
      </h2>
      <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-line-strong)] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-2 bg-[color:var(--color-bg-alt)] p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl text-[color:var(--color-fg)]">{f.title}</h3>
              <span
                className={`font-mono text-xs uppercase tracking-wider ${
                  f.coming
                    ? "text-[color:var(--color-fg-subtle)]"
                    : "text-[color:var(--color-accent)]"
                }`}
              >
                {f.tag}
              </span>
            </div>
            <p className="text-sm leading-6 text-[color:var(--color-fg-muted)]">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
