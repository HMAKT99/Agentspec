"use client";

import type { editor } from "monaco-editor";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ScoreBar } from "./score-bar";
import { FixTab } from "./tabs/fix";
import { HeatmapTab } from "./tabs/heatmap";
import { OutlineTab } from "./tabs/outline";
import { PreviewTab } from "./tabs/preview";
import { ProblemsTab } from "./tabs/problems";
import { ReviewTab } from "./tabs/review";
import { SimulateTab } from "./tabs/simulate";
import { type FixPreview, TAB_ORDER, type TabId } from "./types";
import { useDebouncedLint } from "./use-debounced-lint";

const MonacoPane = dynamic(() => import("./monaco-pane").then((m) => m.MonacoPane), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-alt)] text-sm text-[color:var(--color-fg-muted)]">
      Loading editor…
    </div>
  ),
});

interface Props {
  initialSpec: string;
}

const LS_KEY = "mdpact-editor-spec";

export function EditorShell({ initialSpec }: Props) {
  const [text, setText] = useState<string>(() => hydrateInitial(initialSpec));
  const [activeTab, setActiveTab] = useState<TabId>("heatmap");
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<number | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LS_KEY, text);
    } catch {
      /* no storage, fine */
    }
  }, [text]);

  const report = useDebouncedLint(text);

  const focusLine = useCallback((line: number, column = 1) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.revealLineInCenter(line);
    ed.setPosition({ lineNumber: line, column });
    ed.focus();
  }, []);

  const handleMount = useCallback((ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;
  }, []);

  const applyFix = useCallback((fix: FixPreview) => {
    setText((current) => {
      if (fix.startOffset > current.length || fix.endOffset > current.length) return current;
      return current.slice(0, fix.startOffset) + fix.replacement + current.slice(fix.endOffset);
    });
  }, []);

  const ctx = useMemo(
    () => ({
      text,
      diagnostics: report?.results ?? [],
      fixes: report?.fixes ?? [],
      bindings: report?.extractedBindings ?? [],
      headings: report?.headings ?? [],
      tokens: report?.tokens ?? 0,
      frontmatterKeys: report?.frontmatterKeys ?? [],
      focusLine,
      selectedDiagnostic,
      setSelectedDiagnostic,
      applyFix,
    }),
    [text, report, focusLine, selectedDiagnostic, applyFix],
  );

  const counts = {
    errors: report?.errorCount ?? 0,
    warnings: report?.warningCount ?? 0,
    infos: report?.infoCount ?? 0,
  };
  const emptySpecFired = report?.results.some((r) => r.ruleId === "structure/empty-spec") ?? false;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(560px,4fr)]">
        <div className="h-[70vh] min-h-[520px]">
          <MonacoPane
            value={text}
            onChange={setText}
            diagnostics={ctx.diagnostics}
            onMount={handleMount}
          />
        </div>

        <aside className="flex h-[70vh] min-h-[520px] flex-col overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-alt)]">
          <nav className="flex shrink-0 flex-wrap gap-1 border-b border-[color:var(--color-line)] px-2 py-1.5 text-xs uppercase tracking-wider">
            {TAB_ORDER.map((t) => {
              const active = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`rounded-md px-2.5 py-1 transition-colors ${
                    active
                      ? "bg-[color:var(--color-accent)] text-[color:var(--color-bg)]"
                      : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
          <div className="min-h-0 flex-1 overflow-auto">
            {activeTab === "heatmap" && <HeatmapTab ctx={ctx} />}
            {activeTab === "outline" && <OutlineTab ctx={ctx} />}
            {activeTab === "preview" && <PreviewTab ctx={ctx} />}
            {activeTab === "review" && <ReviewTab ctx={ctx} />}
            {activeTab === "problems" && <ProblemsTab ctx={ctx} />}
            {activeTab === "fix" && <FixTab ctx={ctx} />}
            {activeTab === "simulate" && <SimulateTab ctx={ctx} />}
          </div>
        </aside>
      </div>

      <ScoreBar
        errors={counts.errors}
        warnings={counts.warnings}
        infos={counts.infos}
        tokens={ctx.tokens}
        frontmatterMissing={ctx.frontmatterKeys.length === 0}
        emptySpecFired={emptySpecFired}
      />
    </div>
  );
}

function hydrateInitial(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("spec");
    if (encoded) return decodeURIComponent(escape(atob(encoded)));
    const cached = localStorage.getItem(LS_KEY);
    if (cached && cached.length > 0) return cached;
  } catch {
    /* fall through */
  }
  return fallback;
}
