"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useRef } from "react";
import type { Diagnostic } from "./types";

interface Props {
  value: string;
  onChange: (next: string) => void;
  diagnostics: Diagnostic[];
  onMount?: (editor: editor.IStandaloneCodeEditor) => void;
}

export function MonacoPane({ value, onChange, diagnostics, onMount }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

  const handleMount: OnMount = useCallback(
    (ed, monaco) => {
      editorRef.current = ed;
      monacoRef.current = monaco;
      onMount?.(ed);
    },
    [onMount],
  );

  useEffect(() => {
    const ed = editorRef.current;
    const monaco = monacoRef.current;
    if (!ed || !monaco) return;
    const model = ed.getModel();
    if (!model) return;

    const markers: editor.IMarkerData[] = diagnostics.map((d) => ({
      severity:
        d.severity === "error"
          ? monaco.MarkerSeverity.Error
          : d.severity === "warning"
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Info,
      startLineNumber: d.line,
      startColumn: d.column,
      endLineNumber: d.endLine,
      endColumn: Math.max(d.endColumn, d.column + 1),
      message: `${d.ruleId}: ${d.message}`,
      source: "agentspec",
    }));

    monaco.editor.setModelMarkers(model, "agentspec", markers);
  }, [diagnostics]);

  return (
    <div className="h-full w-full overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)]">
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        theme="vs"
        options={{
          fontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 13,
          minimap: { enabled: false },
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "line",
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          fixedOverflowWidgets: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
