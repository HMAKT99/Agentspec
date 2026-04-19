import type { Rule, RuleResult, SourcePosition, SourceRange } from "@mdpact/core";

const ACRONYM_PATTERN = /\b[A-Z]{3,}\b/g;
const KNOWN_ACRONYMS = new Set([
  "API",
  "CLI",
  "HTTP",
  "HTTPS",
  "JSON",
  "YAML",
  "URL",
  "URI",
  "SQL",
  "XML",
  "CSS",
  "HTML",
  "TS",
  "JS",
  "NPM",
  "AWS",
  "GCP",
  "GPU",
  "CPU",
  "MCP",
  "LLM",
  "UI",
  "UX",
  "SDK",
  "DOM",
  "CI",
  "CD",
  "PR",
  "CRUD",
  "OSS",
  "MIT",
  "TODO",
  "README",
  "UTF",
  "CLAUDE",
  "AGENTS",
  "GEMINI",
  "GPT",
  "MCP",
  "NLP",
]);

export const undefinedTerm: Rule = {
  id: "clarity/undefined-term",
  severity: "info",
  description: "An uncommon acronym appears only once in the spec with no definition.",
  category: "clarity",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/clarity/undefined-term",

  run(ctx): RuleResult[] {
    const counts = new Map<string, number>();
    const firstLocation = new Map<string, { line: number; column: number }>();

    const lines = ctx.spec.raw.split(/\r?\n/);
    lines.forEach((line, idx) => {
      ACRONYM_PATTERN.lastIndex = 0;
      let match: RegExpExecArray | null;
      // biome-ignore lint/suspicious/noAssignInExpressions: exec loop
      while ((match = ACRONYM_PATTERN.exec(line)) !== null) {
        const term = match[0];
        if (KNOWN_ACRONYMS.has(term)) continue;
        counts.set(term, (counts.get(term) ?? 0) + 1);
        if (!firstLocation.has(term)) {
          firstLocation.set(term, { line: idx + 1, column: match.index + 1 });
        }
      }
    });

    const out: RuleResult[] = [];
    for (const [term, count] of counts) {
      if (count !== 1) continue;
      const loc = firstLocation.get(term)!;
      const pos: SourcePosition = { file: ctx.spec.file, line: loc.line, column: loc.column };
      const range: SourceRange = {
        start: pos,
        end: { file: ctx.spec.file, line: loc.line, column: loc.column + term.length },
      };
      out.push({
        ruleId: "clarity/undefined-term",
        severity: "info",
        message: `"${term}" appears once with no definition — spell it out or add a glossary entry.`,
        range,
        data: { term },
      });
    }

    return out;
  },
};
