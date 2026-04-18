import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { renderMarkdown } from "@/lib/markdown";
import { getRule, listRules } from "@/lib/rules";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageParams {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return listRules().map((r) => ({ slug: r.id.split("/") }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const id = slug.join("/");
  const rule = getRule(id);
  return {
    title: `${id} — rule`,
    description: rule?.description ?? "AgentSpec rule documentation",
  };
}

export default async function RulePage({ params }: PageParams) {
  const { slug } = await params;
  const id = slug.join("/");
  const rule = getRule(id);
  if (!rule) notFound();

  const docsHtml = rule.docsMarkdown ? await renderMarkdown(rule.docsMarkdown) : null;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-32 pt-16">
        <nav className="mb-8 text-sm text-[color:var(--color-fg-muted)]">
          <Link href="/rules" className="hover:text-[color:var(--color-fg)]">
            ← All rules
          </Link>
        </nav>

        <header className="mb-8 border-b border-[color:var(--color-line)] pb-6">
          <h1 className="font-mono text-2xl text-[color:var(--color-fg)]">{rule.id}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <MetaPill label="severity" value={rule.severity} />
            <MetaPill label="category" value={rule.category} />
            <MetaPill label="fixable" value={rule.fixable === false ? "no" : rule.fixable} />
          </div>
          <p className="mt-4 text-[color:var(--color-fg-muted)]">{rule.description}</p>
        </header>

        {docsHtml ? (
          <article
            className="rule-prose prose-ish"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown is sanitized by remark-rehype
            dangerouslySetInnerHTML={{ __html: docsHtml }}
          />
        ) : (
          <p className="text-[color:var(--color-fg-muted)]">No extended documentation available.</p>
        )}

        {rule.goodMarkdown && rule.badMarkdown && (
          <section className="mt-12 grid gap-4 sm:grid-cols-2">
            <FixtureCard label="good.md" body={rule.goodMarkdown} tone="ok" />
            <FixtureCard label="bad.md" body={rule.badMarkdown} tone="error" />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] px-2 py-0.5">
      <span className="text-[color:var(--color-fg-subtle)]">{label}:</span>{" "}
      <span className="font-medium text-[color:var(--color-fg)]">{value}</span>
    </span>
  );
}

function FixtureCard({ label, body, tone }: { label: string; body: string; tone: "ok" | "error" }) {
  const toneClass =
    tone === "error"
      ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/30"
      : "border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)]";
  return (
    <div className={`overflow-hidden rounded-[var(--radius)] border ${toneClass}`}>
      <div className="border-b border-[color:var(--color-line)] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        {label}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-sm leading-6">
        <code>{body}</code>
      </pre>
    </div>
  );
}
