import { relative } from "node:path";
import type { LintReport, RuleResult } from "@agentspec/core";
import pc from "picocolors";

export type OutputFormat = "pretty" | "json" | "github";

export function renderReport(report: LintReport, format: OutputFormat): string {
  if (format === "json") return `${renderJson(report)}\n`;
  if (format === "github") return renderGithub(report);
  return renderPretty(report);
}

export function renderJson(report: LintReport): string {
  const payload = {
    errorCount: report.errorCount,
    warningCount: report.warningCount,
    infoCount: report.infoCount,
    durationMs: Math.round(report.durationMs),
    specs: report.specs.map((s) => ({ file: s.file, tokens: s.tokens })),
    results: report.results.map((r) => ({
      ruleId: r.ruleId,
      severity: r.severity,
      message: r.message,
      file: r.range.start.file,
      line: r.range.start.line,
      column: r.range.start.column,
      endLine: r.range.end.line,
      endColumn: r.range.end.column,
      data: r.data,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export function renderGithub(report: LintReport): string {
  if (report.results.length === 0) return "";
  const lines: string[] = [];
  for (const r of report.results) {
    const cmd = githubCommand(r.severity);
    const file = r.range.start.file;
    const line = r.range.start.line;
    const col = r.range.start.column;
    const endLine = r.range.end.line;
    const endCol = r.range.end.column;
    const title = r.ruleId;
    const msg = escapeGithub(r.message);
    lines.push(
      `::${cmd} file=${file},line=${line},col=${col},endLine=${endLine},endColumn=${endCol},title=${title}::${msg}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function githubCommand(sev: "error" | "warning" | "info"): string {
  if (sev === "error") return "error";
  if (sev === "warning") return "warning";
  return "notice";
}

function escapeGithub(s: string): string {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

export function renderPretty(report: LintReport): string {
  const cwd = process.cwd();
  const lines: string[] = [];

  if (report.results.length === 0) {
    lines.push(pc.green("✓ No issues found"));
    lines.push(
      pc.dim(
        `  ${report.specs.length} spec${report.specs.length === 1 ? "" : "s"} scanned in ${Math.round(report.durationMs)}ms`,
      ),
    );
    return `${lines.join("\n")}\n`;
  }

  const byFile = new Map<string, RuleResult[]>();
  for (const r of report.results) {
    const key = r.range.start.file;
    const arr = byFile.get(key) ?? [];
    arr.push(r);
    byFile.set(key, arr);
  }

  for (const [file, results] of byFile) {
    const rel = relative(cwd, file) || file;
    lines.push(pc.underline(rel));
    for (const r of results) {
      lines.push(formatResult(r));
    }
    lines.push("");
  }

  lines.push(summaryLine(report));
  return `${lines.join("\n")}\n`;
}

function formatResult(r: RuleResult): string {
  const loc = pc.dim(`${r.range.start.line}:${r.range.start.column}`);
  const sev = severityBadge(r.severity);
  const id = pc.dim(r.ruleId);
  return `  ${loc}  ${sev}  ${r.message}  ${id}`;
}

function severityBadge(sev: "error" | "warning" | "info"): string {
  if (sev === "error") return pc.red("error  ");
  if (sev === "warning") return pc.yellow("warning");
  return pc.cyan("info   ");
}

function summaryLine(report: LintReport): string {
  const parts: string[] = [];
  if (report.errorCount > 0)
    parts.push(pc.red(`${report.errorCount} error${plural(report.errorCount)}`));
  if (report.warningCount > 0)
    parts.push(pc.yellow(`${report.warningCount} warning${plural(report.warningCount)}`));
  if (report.infoCount > 0) parts.push(pc.cyan(`${report.infoCount} info`));
  const total = parts.join(", ");
  return `${pc.bold("✖")} ${total} (${Math.round(report.durationMs)}ms)`;
}

function plural(n: number): string {
  return n === 1 ? "" : "s";
}
