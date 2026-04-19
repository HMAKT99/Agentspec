"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useDebouncedLint } from "@/components/editor/use-debounced-lint";
import { EXAMPLES, type Example } from "@/lib/examples";

export function ExamplesShell() {
  const [activeSlug, setActiveSlug] = useState<string>(EXAMPLES[0]!.slug);
  const active = useMemo(() => EXAMPLES.find((e) => e.slug === activeSlug)!, [activeSlug]);
  const report = useDebouncedLint(active.markdown, 50);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* left — example list */}
      <aside className="flex flex-col gap-1 lg:sticky lg:top-6 lg:self-start">
        {EXAMPLES.map((ex) => {
          const active = ex.slug === activeSlug;
          return (
            <button
              key={ex.slug}
              type="button"
              onClick={() => setActiveSlug(ex.slug)}
              className={`flex flex-col items-start gap-0.5 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors ${
                active
                  ? "border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)]"
                  : "hover:bg-[color:var(--color-bg-alt)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <SeverityDot severity={ex.severity} />
                <span
                  className={`text-sm ${
                    active
                      ? "font-medium text-[color:var(--color-fg)]"
                      : "text-[color:var(--color-fg)]"
                  }`}
                >
                  {ex.title}
                </span>
              </div>
              {ex.ruleId && (
                <span className="pl-4 font-mono text-[11px] text-[color:var(--color-fg-subtle)]">
                  {ex.ruleId}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* right — input + output */}
      <main className="flex flex-col gap-4">
        <ExampleHeader example={active} />

        <div className="grid gap-4 lg:grid-cols-2">
          <InputCard markdown={active.markdown} />
          <OutputCard markdown={active.markdown} report={report} />
        </div>

        <div className="rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] p-5 text-sm leading-6 text-[color:var(--color-fg-muted)]">
          {active.explanation}
        </div>
      </main>
    </div>
  );
}

function ExampleHeader({ example }: { example: Example }) {
  const editorHref = useMemo(() => {
    if (typeof window === "undefined") return "/editor";
    try {
      const encoded = btoa(unescape(encodeURIComponent(example.markdown)));
      return `/editor?spec=${encoded}`;
    } catch {
      return "/editor";
    }
  }, [example.markdown]);

  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{example.title}</h2>
        <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">{example.summary}</p>
      </div>
      <Link
        href={editorHref}
        className="inline-flex h-9 shrink-0 items-center rounded-[8px] border border-[color:var(--color-line)] px-4 text-xs font-medium text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-alt)]"
      >
        Open in editor →
      </Link>
    </header>
  );
}

function InputCard({ markdown }: { markdown: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)]">
      <div className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        <span>Input</span>
        <span className="font-mono text-[10px] normal-case tracking-normal">CLAUDE.md</span>
      </div>
      <pre className="overflow-x-auto bg-[color:var(--color-bg)] px-4 py-4 font-mono text-[13px] leading-6 text-[color:var(--color-fg)]">
        <code>{markdown}</code>
      </pre>
    </div>
  );
}

function OutputCard({
  markdown,
  report,
}: {
  markdown: string;
  report: ReturnType<typeof useDebouncedLint>;
}) {
  const score = scoreOf(report, markdown);

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)]">
      <div className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        <span>Output</span>
        <span className="font-mono text-[10px] normal-case tracking-normal">$ mdpact lint</span>
      </div>

      <div className="bg-[color:var(--color-bg)] px-4 py-4">
        {!report ? (
          <div className="font-mono text-[13px] text-[color:var(--color-fg-subtle)]">running…</div>
        ) : report.results.length === 0 ? (
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[13px] text-[color:var(--color-fg)]">
              <span className="text-green-700">✓</span> No issues found
            </div>
            <ScoreLine score={score} report={report} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {report.results.map((r, i) => (
              <DiagnosticLine key={`${r.ruleId}-${i}`} diag={r} />
            ))}
            <div className="pt-2 font-mono text-[13px] text-[color:var(--color-fg-muted)]">
              ✖ {summaryLine(report)}
            </div>
            <ScoreLine score={score} report={report} />
          </div>
        )}
      </div>
    </div>
  );
}

function DiagnosticLine({
  diag,
}: {
  diag: {
    ruleId: string;
    severity: "error" | "warning" | "info";
    message: string;
    line: number;
    column: number;
  };
}) {
  const sevClass =
    diag.severity === "error"
      ? "text-[color:var(--color-accent)]"
      : diag.severity === "warning"
        ? "text-[#8A6500]"
        : "text-[#1A4F9C]";

  return (
    <div className="flex flex-col gap-1 rounded-md border border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] px-3 py-2 font-mono text-[13px] leading-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="text-[color:var(--color-fg-subtle)]">
          {diag.line}:{diag.column}
        </span>
        <span className={`font-semibold ${sevClass}`}>{diag.severity}</span>
        <span className="text-[11px] text-[color:var(--color-fg-subtle)]">{diag.ruleId}</span>
      </div>
      <div className="whitespace-pre-wrap text-[color:var(--color-fg)]">{diag.message}</div>
    </div>
  );
}

function ScoreLine({
  score,
  report,
}: {
  score: number;
  report: NonNullable<ReturnType<typeof useDebouncedLint>>;
}) {
  const color =
    score >= 80
      ? "text-[color:var(--color-fg)]"
      : score >= 60
        ? "text-[#8A6500]"
        : "text-[color:var(--color-accent)]";

  return (
    <div className={`font-mono text-[13px] ${color}`}>
      Score {score}/100 · ~{report.tokens.toLocaleString()} tok
    </div>
  );
}

function scoreOf(report: ReturnType<typeof useDebouncedLint>, markdown: string): number {
  if (!report) return 100;
  const frontmatterMissing = !/^---\n/.test(markdown.trimStart());
  const raw =
    100 -
    8 * report.errorCount -
    3 * report.warningCount -
    1 * report.infoCount -
    (frontmatterMissing ? 2 : 0);
  let score = Math.max(0, Math.round(raw));
  if (report.results.some((r) => r.ruleId === "structure/empty-spec")) {
    score = Math.min(score, 40);
  }
  return score;
}

function summaryLine(report: NonNullable<ReturnType<typeof useDebouncedLint>>): string {
  const parts: string[] = [];
  if (report.errorCount > 0) parts.push(`${report.errorCount} error${plural(report.errorCount)}`);
  if (report.warningCount > 0)
    parts.push(`${report.warningCount} warning${plural(report.warningCount)}`);
  if (report.infoCount > 0) parts.push(`${report.infoCount} info`);
  return parts.join(", ");
}

function plural(n: number): string {
  return n === 1 ? "" : "s";
}

function SeverityDot({ severity }: { severity: "error" | "warning" | "info" | "clean" }) {
  const bg = {
    error: "bg-[color:var(--color-accent)]",
    warning: "bg-[#C8A200]",
    info: "bg-[#4A7CBE]",
    clean: "bg-[color:var(--color-fg-subtle)]",
  }[severity];
  return (
    <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${bg}`} aria-hidden="true" />
  );
}
