import type { Rule, RuleResult, SourceRange } from "@agentspec/core";

interface Pattern {
  id: string;
  regex: RegExp;
  label: string;
}

const PATTERNS: Pattern[] = [
  {
    id: "email",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: "email address",
  },
  {
    id: "ssn",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    label: "US Social Security number",
  },
  {
    id: "phone",
    regex: /\b(?:\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/g,
    label: "phone number",
  },
  {
    id: "credit-card",
    regex: /\b(?:\d[ -]?){13,16}\b/g,
    label: "credit card number",
  },
];

const ALLOWED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "noreply.github.com",
]);

export const piiInSpec: Rule = {
  id: "compliance/pii-in-spec",
  severity: "warning",
  description: "Likely PII (email, SSN, phone, card) appears in spec text.",
  category: "compliance",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/compliance/pii-in-spec",

  run(ctx): RuleResult[] {
    const results: RuleResult[] = [];
    const lines = ctx.spec.raw.split(/\r?\n/);

    lines.forEach((line, idx) => {
      for (const pattern of PATTERNS) {
        pattern.regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        // biome-ignore lint/suspicious/noAssignInExpressions: exec loop
        while ((match = pattern.regex.exec(line)) !== null) {
          if (pattern.id === "email") {
            const domain = match[0].split("@")[1]?.toLowerCase();
            if (domain && ALLOWED_EMAIL_DOMAINS.has(domain)) continue;
          }
          results.push({
            ruleId: "compliance/pii-in-spec",
            severity: "warning",
            message: `Possible ${pattern.label} in spec: ${truncate(match[0])}`,
            range: positionRange(ctx.spec.file, idx + 1, match.index + 1, match[0].length),
            data: { kind: pattern.id, value: match[0] },
          });
        }
      }
    });

    return results;
  },
};

function positionRange(file: string, line: number, col: number, len: number): SourceRange {
  return {
    start: { file, line, column: col },
    end: { file, line, column: col + len },
  };
}

function truncate(s: string, n = 40): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
