"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EditorTabContext } from "../types";

type Triage = "pending" | "accepted" | "skipped";

interface Props {
  ctx: EditorTabContext;
}

export function ReviewTab({ ctx }: Props) {
  const diagnostics = ctx.diagnostics;
  const [triage, setTriage] = useState<Record<string, Triage>>({});
  const [cursor, setCursor] = useState(0);

  // Collapse cursor when the diagnostic list shrinks.
  useEffect(() => {
    if (cursor >= diagnostics.length) setCursor(Math.max(0, diagnostics.length - 1));
  }, [cursor, diagnostics.length]);

  const keyOf = useCallback(
    (i: number) => {
      const d = diagnostics[i];
      if (!d) return null;
      return `${d.ruleId}@${d.line}:${d.column}`;
    },
    [diagnostics],
  );

  const current = diagnostics[cursor];
  const currentKey = keyOf(cursor);

  const next = useCallback(() => {
    if (diagnostics.length === 0) return;
    setCursor((c) => (c + 1) % diagnostics.length);
  }, [diagnostics.length]);

  const prev = useCallback(() => {
    if (diagnostics.length === 0) return;
    setCursor((c) => (c - 1 + diagnostics.length) % diagnostics.length);
  }, [diagnostics.length]);

  const accept = useCallback(() => {
    if (!currentKey) return;
    setTriage((t) => ({ ...t, [currentKey]: "accepted" }));
    next();
  }, [currentKey, next]);

  const skip = useCallback(() => {
    if (!currentKey) return;
    setTriage((t) => ({ ...t, [currentKey]: "skipped" }));
    next();
  }, [currentKey, next]);

  // Jump editor when cursor changes.
  useEffect(() => {
    if (current) ctx.focusLine(current.line, current.column);
  }, [current, ctx]);

  // J / K keyboard navigation.
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (target?.isContentEditable) return;
      if (ev.key === "j") {
        ev.preventDefault();
        next();
      } else if (ev.key === "k") {
        ev.preventDefault();
        prev();
      } else if (ev.key === "a") {
        ev.preventDefault();
        accept();
      } else if (ev.key === "s") {
        ev.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, accept, skip]);

  const counts = useMemo(() => {
    let accepted = 0;
    let skipped = 0;
    let pending = 0;
    for (let i = 0; i < diagnostics.length; i++) {
      const k = keyOf(i);
      if (!k) continue;
      const t = triage[k] ?? "pending";
      if (t === "accepted") accepted++;
      else if (t === "skipped") skipped++;
      else pending++;
    }
    return { accepted, skipped, pending };
  }, [diagnostics.length, keyOf, triage]);

  if (diagnostics.length === 0) {
    return (
      <div className="p-4 text-sm text-[color:var(--color-fg-muted)]">
        ✓ Nothing to review — spec is clean.
      </div>
    );
  }

  const status: Triage = (currentKey && triage[currentKey]) || "pending";

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--color-line)] px-4 py-2.5 text-xs text-[color:var(--color-fg-muted)]">
        <span>
          {cursor + 1} of {diagnostics.length}
        </span>
        <span className="flex gap-3">
          <span>✓ {counts.accepted}</span>
          <span>⤼ {counts.skipped}</span>
          <span>· {counts.pending} pending</span>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        {current && (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <code className="font-mono text-sm text-[color:var(--color-fg)]">
                {current.ruleId}
              </code>
              <span className="text-xs text-[color:var(--color-fg-subtle)]">
                line {current.line}
              </span>
            </div>
            <SeverityRow severity={current.severity} />
            <p className="text-[15px] leading-6 text-[color:var(--color-fg)]">{current.message}</p>
            {status !== "pending" && (
              <p className="text-xs text-[color:var(--color-fg-subtle)]">
                Marked as {status}. Re-decide with <Kbd>A</Kbd> or <Kbd>S</Kbd>.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-[color:var(--color-line)] px-4 py-3">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={prev}
            className="rounded-md border border-[color:var(--color-line)] px-2.5 py-1 text-xs hover:bg-[color:var(--color-bg-alt)]"
          >
            ← <Kbd>K</Kbd>
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-md border border-[color:var(--color-line)] px-2.5 py-1 text-xs hover:bg-[color:var(--color-bg-alt)]"
          >
            <Kbd>J</Kbd> →
          </button>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={skip}
            className="rounded-md border border-[color:var(--color-line)] px-3 py-1 text-xs hover:bg-[color:var(--color-bg-alt)]"
          >
            Skip <Kbd>S</Kbd>
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-[color:var(--color-fg)] px-3 py-1 text-xs text-[color:var(--color-bg)] hover:opacity-90"
          >
            Accept <Kbd dark>A</Kbd>
          </button>
        </div>
      </div>
    </div>
  );
}

function SeverityRow({ severity }: { severity: "error" | "warning" | "info" }) {
  const cls = {
    error: "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]",
    warning: "bg-[#FFF2C7] text-[#7A5B00]",
    info: "bg-[#E6F0FF] text-[#1A4F9C]",
  }[severity];
  return (
    <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{severity}</span>
  );
}

function Kbd({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <kbd
      className={`ml-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border px-1 font-mono text-[10px] ${
        dark
          ? "border-[color:var(--color-bg)]/30 bg-[color:var(--color-bg)]/15"
          : "border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] text-[color:var(--color-fg-muted)]"
      }`}
    >
      {children}
    </kbd>
  );
}
