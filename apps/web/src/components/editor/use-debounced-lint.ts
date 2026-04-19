"use client";

import { lint, parseSpec } from "@agentspec/core";
import { allRules } from "@agentspec/rules";
import { useEffect, useState } from "react";

export interface LintResult {
  id: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  tokens: number;
  frontmatterKeys: string[];
  extractedBindings: Array<{
    id: string;
    text: string;
    polarity: "affirm" | "negate";
    offset: number;
    line: number;
    column: number;
    headingPath: string[];
  }>;
  headings: Array<{ depth: number; text: string; line: number }>;
  results: Array<{
    ruleId: string;
    severity: "error" | "warning" | "info";
    message: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
  }>;
}

/**
 * Parse + lint the given spec on the main thread, debounced by `delayMs`.
 *
 * We deliberately don't use a web worker: the lint pass is well under 50 ms
 * on real specs, and Next's worker build pipeline struggles to resolve our
 * workspace TS packages (`@agentspec/core`, `@agentspec/rules`) during dev.
 * If lint ever gets slow enough to matter, switch to a pre-bundled .js worker
 * rather than the inline `new Worker(new URL(...))` pattern.
 */
export function useDebouncedLint(text: string, delayMs = 200): LintResult | null {
  const [result, setResult] = useState<LintResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = window.setTimeout(() => {
      setResult(runLint(text));
    }, delayMs);
    return () => window.clearTimeout(handle);
  }, [text, delayMs]);

  return result;
}

let nextRequestId = 0;

function runLint(text: string): LintResult {
  const id = ++nextRequestId;
  try {
    const spec = parseSpec("playground.md", text);
    const report = lint({ specs: [spec], rules: allRules });

    const headings: LintResult["headings"] = [];
    for (const node of spec.tree.children) {
      if (node.type === "heading" && node.position) {
        let heading = "";
        for (const c of node.children) {
          if ("value" in c && typeof c.value === "string") heading += c.value;
        }
        headings.push({
          depth: node.depth,
          text: heading.trim(),
          line: node.position.start.line,
        });
      }
    }

    return {
      id,
      errorCount: report.errorCount,
      warningCount: report.warningCount,
      infoCount: report.infoCount,
      tokens: spec.tokens,
      frontmatterKeys: Object.keys(spec.frontmatter),
      extractedBindings: spec.extractedRules
        .filter((r) => r.kind === "binding")
        .map((r) => ({
          id: r.id,
          text: r.text,
          polarity: r.polarity,
          offset: r.range.start.offset ?? 0,
          line: r.range.start.line,
          column: r.range.start.column,
          headingPath: r.headingPath,
        })),
      headings,
      results: report.results.map((r) => ({
        ruleId: r.ruleId,
        severity: r.severity,
        message: r.message,
        line: r.range.start.line,
        column: r.range.start.column,
        endLine: r.range.end.line,
        endColumn: r.range.end.column,
      })),
    };
  } catch (err) {
    console.warn("[agentspec-lint]", err);
    return {
      id,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      tokens: 0,
      frontmatterKeys: [],
      extractedBindings: [],
      headings: [],
      results: [],
    };
  }
}
