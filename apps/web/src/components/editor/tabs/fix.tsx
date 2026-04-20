"use client";

import type { EditorTabContext, FixPreview } from "../types";

interface Props {
  ctx: EditorTabContext;
}

export function FixTab({ ctx }: Props) {
  const fixes = ctx.fixes;
  const safeCount = fixes.filter((f) => f.safety === "safe").length;
  const unsafeCount = fixes.filter((f) => f.safety === "unsafe").length;

  if (fixes.length === 0) {
    return (
      <div className="p-4 text-sm text-[color:var(--color-fg-muted)]">
        ✓ No auto-fixable diagnostics. Either your spec is clean, or the remaining diagnostics need
        a human decision (conflicts, tool policy, clarity — things mdpact won't rewrite for you).
      </div>
    );
  }

  const applyAllSafe = () => {
    for (const f of [...fixes].filter((f) => f.safety === "safe")) {
      ctx.applyFix(f);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[color:var(--color-line)] px-4 py-3">
        <div className="flex items-baseline gap-3 text-xs uppercase tracking-wider">
          <span className="text-[color:var(--color-fg-muted)]">Fix</span>
          <span className="font-mono text-[color:var(--color-fg-subtle)]">
            {safeCount} safe · {unsafeCount} unsafe
          </span>
        </div>
        {safeCount > 0 && (
          <button
            type="button"
            onClick={applyAllSafe}
            className="rounded-md border border-[color:var(--color-accent)]/60 bg-[color:var(--color-accent)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[color:var(--color-bg)] transition hover:bg-[color:var(--color-accent-hot)]"
          >
            Apply all safe
          </button>
        )}
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-[color:var(--color-line)] overflow-auto">
        {fixes.map((fix, idx) => {
          const diag = ctx.diagnostics[fix.diagnosticIndex];
          return (
            <li key={`${fix.ruleId}-${idx}`}>
              <FixRow fix={fix} diagnosticLine={diag?.line ?? 0} ctx={ctx} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FixRow({
  fix,
  diagnosticLine,
  ctx,
}: {
  fix: FixPreview;
  diagnosticLine: number;
  ctx: EditorTabContext;
}) {
  // Build a tiny before/after preview from the current text offsets.
  const before = ctx.text.slice(fix.startOffset, fix.endOffset);
  const preview = renderDiff(before, fix.replacement);

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <code className="font-mono text-xs text-[color:var(--color-fg)]">{fix.ruleId}</code>
          <span
            className={`rounded-full px-2 py-[1px] text-[10px] uppercase tracking-wider ${
              fix.safety === "safe"
                ? "bg-[color:var(--color-bg-panel)] text-[color:var(--color-fg-muted)]"
                : "border border-[color:var(--color-accent)]/50 text-[color:var(--color-accent)]"
            }`}
          >
            {fix.safety}
          </span>
        </div>
        <span className="text-xs text-[color:var(--color-fg-subtle)]">
          {diagnosticLine > 0 ? `line ${diagnosticLine}` : "start"}
        </span>
      </div>

      <p className="text-sm text-[color:var(--color-fg)]">{fix.description}</p>

      <div className="rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] font-mono text-[11px] leading-5">
        {preview.before && (
          <div className="border-b border-[color:var(--color-line)] px-3 py-2 text-[color:var(--color-accent)]">
            − {truncate(preview.before)}
          </div>
        )}
        {preview.after && (
          <div className="px-3 py-2 text-[#7dfaff]">+ {truncate(preview.after)}</div>
        )}
        {!preview.before && !preview.after && (
          <div className="px-3 py-2 text-[color:var(--color-fg-subtle)]">(no-op)</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ctx.applyFix(fix)}
          className="rounded-md border border-[color:var(--color-line-strong)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[color:var(--color-fg)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
        >
          Apply
        </button>
        {diagnosticLine > 0 && (
          <button
            type="button"
            onClick={() => ctx.focusLine(diagnosticLine)}
            className="rounded-md px-2 py-1 text-xs text-[color:var(--color-fg-muted)] transition hover:text-[color:var(--color-accent)]"
          >
            Go to line
          </button>
        )}
      </div>
    </div>
  );
}

function renderDiff(before: string, after: string): { before: string; after: string } {
  // Show the raw strings; for insert-only fixes (e.g. frontmatter prepend) before will be empty.
  return { before: before.replace(/\n/g, "⏎"), after: after.replace(/\n/g, "⏎") };
}

function truncate(s: string): string {
  const MAX = 140;
  return s.length > MAX ? `${s.slice(0, MAX)}…` : s;
}
