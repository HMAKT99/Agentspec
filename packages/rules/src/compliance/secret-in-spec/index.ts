import type { Rule, RuleResult, SourceRange } from "@mdpact/core";

interface Pattern {
  id: string;
  regex: RegExp;
  label: string;
}

const PATTERNS: Pattern[] = [
  { id: "openai", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g, label: "OpenAI-style key" },
  {
    id: "anthropic",
    regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
    label: "Anthropic API key",
  },
  { id: "aws-access", regex: /\bAKIA[0-9A-Z]{16}\b/g, label: "AWS access key id" },
  { id: "github-pat", regex: /\bghp_[A-Za-z0-9]{30,}\b/g, label: "GitHub personal access token" },
  { id: "github-oauth", regex: /\bgho_[A-Za-z0-9]{30,}\b/g, label: "GitHub OAuth token" },
  { id: "slack", regex: /\bxox[abpros]-[A-Za-z0-9-]{20,}\b/g, label: "Slack token" },
  {
    id: "private-key",
    regex: /-----BEGIN (?:RSA|EC|OPENSSH|PGP|DSA) PRIVATE KEY-----/g,
    label: "private key block",
  },
];

export const secretInSpec: Rule = {
  id: "compliance/secret-in-spec",
  severity: "error",
  description: "Likely API key or secret pattern found in the spec.",
  category: "compliance",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/compliance/secret-in-spec",

  run(ctx): RuleResult[] {
    const results: RuleResult[] = [];
    const lines = ctx.spec.raw.split(/\r?\n/);

    lines.forEach((line, idx) => {
      for (const pattern of PATTERNS) {
        pattern.regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        // biome-ignore lint/suspicious/noAssignInExpressions: exec loop
        while ((match = pattern.regex.exec(line)) !== null) {
          results.push({
            ruleId: "compliance/secret-in-spec",
            severity: "error",
            message: `Possible ${pattern.label} in spec — rotate and remove immediately.`,
            range: positionRange(ctx.spec.file, idx + 1, match.index + 1, match[0].length),
            data: { kind: pattern.id },
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
