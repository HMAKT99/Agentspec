"use client";

import { type LintReport, lint, parseSpec } from "@agentspec/core";
import { allRules } from "@agentspec/rules";
import { useEffect, useMemo, useState } from "react";

interface Props {
  initialSpec: string;
}

const LS_KEY = "agentspec-playground-spec";

export function PlaygroundShell({ initialSpec }: Props) {
  const [spec, setSpec] = useState<string>(() => hydrateInitial(initialSpec));

  // Persist to ?spec= share link + localStorage (no server).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, spec);
    } catch {
      /* no storage, fine */
    }
  }, [spec]);

  const report: LintReport | null = useMemo(() => {
    if (!spec.trim()) return null;
    try {
      const parsed = parseSpec("playground.md", spec);
      return lint({ specs: [parsed], rules: allRules });
    } catch (err) {
      console.warn("parse error", err);
      return null;
    }
  }, [spec]);

  const score = report ? computeScore(report) : 100;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="flex flex-col">
        <EditorToolbar spec={spec} setSpec={setSpec} initialSpec={initialSpec} />
        <textarea
          className="h-[70vh] w-full resize-none rounded-b-[var(--radius)] border border-t-0 border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] p-4 font-mono text-sm leading-6 focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]"
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          spellCheck={false}
        />
      </div>

      <aside className="flex flex-col gap-4">
        <ScorePanel score={score} report={report} />
        <DiagnosticsPanel report={report} />
      </aside>
    </div>
  );
}

function EditorToolbar({
  spec,
  setSpec,
  initialSpec,
}: {
  spec: string;
  setSpec: (s: string) => void;
  initialSpec: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-t-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-3 py-2 text-xs text-[color:var(--color-fg-muted)]">
      <span className="font-mono">playground.md</span>
      <div className="flex gap-3">
        <button
          type="button"
          className="hover:text-[color:var(--color-fg)]"
          onClick={async () => {
            if (typeof window === "undefined") return;
            const url = new URL(window.location.href);
            url.searchParams.set("spec", btoa(unescape(encodeURIComponent(spec))));
            await navigator.clipboard.writeText(url.toString());
          }}
        >
          Copy share URL
        </button>
        <button
          type="button"
          className="hover:text-[color:var(--color-fg)]"
          onClick={() => setSpec(initialSpec)}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function ScorePanel({ score, report }: { score: number; report: LintReport | null }) {
  const toneBg =
    score >= 80
      ? "bg-[color:var(--color-bg-alt)]"
      : score >= 60
        ? "bg-[#FFF2C7]"
        : "bg-[color:var(--color-accent-soft)]";
  return (
    <div
      className={`rounded-[var(--radius)] border border-[color:var(--color-line)] ${toneBg} p-5`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-[color:var(--color-fg-muted)]">Score</span>
        <span className="text-3xl font-semibold tracking-tight">{score}</span>
      </div>
      {report && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--color-fg-muted)]">
          <span>
            {report.errorCount} error{plural(report.errorCount)}
          </span>
          <span>
            {report.warningCount} warning{plural(report.warningCount)}
          </span>
          <span>{report.infoCount} info</span>
        </div>
      )}
    </div>
  );
}

function DiagnosticsPanel({ report }: { report: LintReport | null }) {
  if (!report || report.results.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-[color:var(--color-line)] p-5 text-sm text-[color:var(--color-fg-muted)]">
        ✓ No diagnostics.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)]">
      <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg-muted)]">
        Diagnostics
      </div>
      <ul className="max-h-[50vh] divide-y divide-[color:var(--color-line)] overflow-y-auto">
        {report.results.map((r, idx) => (
          <li
            key={`${r.ruleId}-${idx}-${r.range.start.line}`}
            className="flex flex-col gap-1 px-4 py-3 text-sm"
          >
            <div className="flex items-baseline justify-between gap-3">
              <code className="font-mono text-xs text-[color:var(--color-fg)]">{r.ruleId}</code>
              <span className="text-xs text-[color:var(--color-fg-subtle)]">
                {r.range.start.line}:{r.range.start.column}
              </span>
            </div>
            <span className="text-sm text-[color:var(--color-fg-muted)]">{r.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function hydrateInitial(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("spec");
    if (encoded) {
      return decodeURIComponent(escape(atob(encoded)));
    }
    const cached = localStorage.getItem(LS_KEY);
    if (cached && cached.length > 0) return cached;
  } catch {
    /* fall through */
  }
  return fallback;
}

function computeScore(report: LintReport): number {
  const raw = 100 - 8 * report.errorCount - 3 * report.warningCount - 1 * report.infoCount;
  return Math.max(0, Math.round(raw));
}

function plural(n: number): string {
  return n === 1 ? "" : "s";
}
