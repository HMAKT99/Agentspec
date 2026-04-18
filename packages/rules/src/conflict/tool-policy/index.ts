import type { Rule, RuleResult } from "@agentspec/core";

const RESTRICT_CUES = [
  "never",
  "don't",
  "do not",
  "avoid",
  "forbidden",
  "disallowed",
  "not allowed",
  "restricted",
  "must not",
];

const ALLOW_CUES = [
  "use ",
  "run ",
  "always use",
  "prefer",
  "allowed",
  "recommended",
  "when you",
  "if you need",
];

export const toolPolicy: Rule = {
  id: "conflict/tool-policy",
  severity: "warning",
  description: "A tool is described as allowed in one place and restricted in another.",
  category: "conflict",
  fixable: false,
  docsUrl: "https://agentspec.dev/rules/conflict/tool-policy",

  run(ctx): RuleResult[] {
    const byTool = new Map<
      string,
      { allow: typeof ctx.spec.inlineCode; restrict: typeof ctx.spec.inlineCode }
    >();

    for (const ref of ctx.spec.inlineCode) {
      const token = ref.text.trim().split(/\s+/)[0]?.toLowerCase();
      if (!token) continue;
      const lower = ref.surroundingText.toLowerCase();
      const bucket = byTool.get(token) ?? { allow: [], restrict: [] };

      if (RESTRICT_CUES.some((cue) => lower.includes(cue))) bucket.restrict.push(ref);
      else if (ALLOW_CUES.some((cue) => lower.includes(cue))) bucket.allow.push(ref);

      byTool.set(token, bucket);
    }

    const out: RuleResult[] = [];
    for (const [tool, { allow, restrict }] of byTool) {
      if (allow.length === 0 || restrict.length === 0) continue;
      out.push({
        ruleId: "conflict/tool-policy",
        severity: "warning",
        message: `Tool "${tool}" appears as both permitted and restricted — clarify whether the agent may use it.`,
        range: allow[0]!.range,
        data: {
          tool,
          allowedAt: allow.map((r) => r.range),
          restrictedAt: restrict.map((r) => r.range),
        },
      });
    }
    return out;
  },
};
