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
    tag: "agentspec lint",
  },
  {
    title: "Test",
    body: "Behavior-prediction engine runs tasks across Anthropic, OpenAI, and Google models with a USD budget guardrail.",
    tag: "agentspec test",
  },
  {
    title: "Score",
    body: "A single 0–100 score your PR comment can delta against the base branch, with deductions you can audit.",
    tag: "agentspec score",
  },
  {
    title: "CI",
    body: "GitHub Action posts a sticky PR comment, inline annotations, and fails the check if the score drops.",
    tag: "GitHub Action",
  },
  {
    title: "Fix",
    body: "Safe-by-default auto-fixes with a --unsafe opt-in for transformational rewrites.",
    tag: "agentspec fix",
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
      <h2 className="mb-8 text-2xl font-semibold tracking-tight">Everything the CLI does.</h2>
      <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-line)] sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-2 bg-[color:var(--color-bg)] p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold">{f.title}</h3>
              <span
                className={`font-mono text-xs ${
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
