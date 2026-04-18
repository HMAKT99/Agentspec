import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { groupByCategory, listRules } from "@/lib/rules";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "The AgentSpec rule catalog — every built-in check with its severity, category, and fix guidance.",
};

export default function RulesIndexPage() {
  const rules = listRules();
  const byCategory = groupByCategory(rules);
  const categories = Object.keys(byCategory).sort();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-32 pt-16">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight">Rules</h1>
          <p className="mt-3 max-w-2xl text-[color:var(--color-fg-muted)]">
            {rules.length} built-in rules spanning conflict detection, clarity, tool policy,
            structure, tokens, compliance, and (after a behavior run) cross-model divergence.
          </p>
        </header>

        {categories.map((cat) => (
          <section key={cat} className="mb-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[color:var(--color-fg-muted)]">
              {cat}
            </h2>
            <ul className="divide-y divide-[color:var(--color-line)] rounded-[var(--radius)] border border-[color:var(--color-line)]">
              {byCategory[cat]!.map((rule) => (
                <li key={rule.id}>
                  <Link
                    href={`/rules/${encodeURIComponent(rule.id)}`}
                    className="flex flex-col gap-1 px-5 py-4 hover:bg-[color:var(--color-bg-alt)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-sm text-[color:var(--color-fg)]">
                        {rule.id}
                      </code>
                      <SeverityBadge severity={rule.severity} />
                      {rule.fixable !== false && (
                        <span className="rounded-full bg-[color:var(--color-bg-alt)] px-2 py-0.5 text-xs text-[color:var(--color-fg-muted)]">
                          fixable ({rule.fixable})
                        </span>
                      )}
                    </div>
                    <span className="max-w-xl text-sm text-[color:var(--color-fg-muted)]">
                      {rule.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}

function SeverityBadge({ severity }: { severity: "error" | "warning" | "info" }) {
  const styles = {
    error: "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
    warning: "bg-[#FFF2C7] text-[#7A5B00]",
    info: "bg-[#E6F0FF] text-[#1A4F9C]",
  }[severity];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>{severity}</span>
  );
}
