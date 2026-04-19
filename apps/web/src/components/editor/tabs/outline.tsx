"use client";

import type { EditorTabContext } from "../types";

interface Props {
  ctx: EditorTabContext;
}

export function OutlineTab({ ctx }: Props) {
  if (ctx.headings.length === 0) {
    return (
      <div className="p-4 text-sm text-[color:var(--color-fg-muted)]">
        No headings yet. Add a <code className="font-mono">##</code> section and it'll show up here.
      </div>
    );
  }

  // Pair each heading with its range so we can attribute diagnostics.
  const spans = ctx.headings.map((h, i) => ({
    depth: h.depth,
    text: h.text || "(untitled)",
    startLine: h.line,
    endLine: ctx.headings[i + 1]?.line ?? Number.POSITIVE_INFINITY,
  }));

  const countsBySection = spans.map((s) => {
    const inSection = ctx.diagnostics.filter((d) => d.line >= s.startLine && d.line < s.endLine);
    const errors = inSection.filter((d) => d.severity === "error").length;
    const warnings = inSection.filter((d) => d.severity === "warning").length;
    const infos = inSection.filter((d) => d.severity === "info").length;
    return { ...s, errors, warnings, infos };
  });

  return (
    <div className="p-4">
      <h3 className="mb-3 text-sm font-semibold text-[color:var(--color-fg)]">Outline</h3>
      <ul className="flex flex-col">
        {countsBySection.map((s, i) => (
          <li key={`${s.startLine}-${i}`}>
            <button
              type="button"
              onClick={() => ctx.focusLine(s.startLine)}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-[color:var(--color-bg-alt)]"
              style={{ paddingLeft: `${(s.depth - 1) * 14 + 8}px` }}
            >
              <span className="truncate pr-2 text-sm text-[color:var(--color-fg)]">{s.text}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                {s.errors > 0 && <Pill tone="error">{s.errors}</Pill>}
                {s.warnings > 0 && <Pill tone="warning">{s.warnings}</Pill>}
                {s.infos > 0 && <Pill tone="info">{s.infos}</Pill>}
                {s.errors === 0 && s.warnings === 0 && s.infos === 0 && (
                  <span className="text-xs text-[color:var(--color-fg-subtle)]">—</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pill({
  tone,
  children,
}: { tone: "error" | "warning" | "info"; children: React.ReactNode }) {
  const cls = {
    error: "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
    warning: "bg-[#FFF2C7] text-[#7A5B00]",
    info: "bg-[#E6F0FF] text-[#1A4F9C]",
  }[tone];
  return <span className={`rounded-full px-1.5 text-xs font-medium ${cls}`}>{children}</span>;
}
