"use client";

import type { EditorTabContext } from "../types";

interface Props {
  ctx: EditorTabContext;
}

export function ProblemsTab({ ctx }: Props) {
  if (ctx.diagnostics.length === 0) {
    return <div className="p-4 text-sm text-[color:var(--color-fg-muted)]">✓ No diagnostics.</div>;
  }

  return (
    <ul className="divide-y divide-[color:var(--color-line)]">
      {ctx.diagnostics.map((d, i) => (
        <li key={`${d.ruleId}-${i}-${d.line}`}>
          <button
            type="button"
            onClick={() => {
              ctx.setSelectedDiagnostic(i);
              ctx.focusLine(d.line, d.column);
            }}
            className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-[color:var(--color-bg-alt)]"
          >
            <div className="flex w-full items-baseline justify-between gap-3">
              <code className="font-mono text-xs text-[color:var(--color-fg)]">{d.ruleId}</code>
              <span className="text-xs text-[color:var(--color-fg-subtle)]">
                {d.line}:{d.column}
              </span>
            </div>
            <span className="text-sm text-[color:var(--color-fg-muted)]">{d.message}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
