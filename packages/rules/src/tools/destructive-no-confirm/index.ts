import type { Rule, RuleResult } from "@mdpact/core";

const DESTRUCTIVE_VERBS = [
  "delete",
  "drop",
  "remove",
  "purge",
  "destroy",
  "wipe",
  "truncate",
  "reset",
  "rm",
  "force-push",
  "deploy",
  "publish",
  "release",
  "send",
  "email",
  "post",
  "transfer",
  "charge",
];

const CONFIRM_CUES = [
  "confirm",
  "approval",
  "approved",
  "approve",
  "ask",
  "human",
  "review",
  "verify",
  "double-check",
  "sign-off",
  "sign off",
  "authorize",
  "gate",
  "dry run",
  "dry-run",
];

export const destructiveNoConfirm: Rule = {
  id: "tools/destructive-no-confirm",
  severity: "error",
  description:
    "A destructive action is described without any confirmation / human-gate language nearby.",
  category: "tools",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/tools/destructive-no-confirm",

  run(ctx): RuleResult[] {
    const out: RuleResult[] = [];
    for (const rule of ctx.spec.extractedRules) {
      if (rule.kind !== "binding" && rule.kind !== "advisory") continue;

      const lower = rule.text.toLowerCase();
      const verb = DESTRUCTIVE_VERBS.find((v) => containsWord(lower, v));
      if (!verb) continue;
      if (CONFIRM_CUES.some((cue) => lower.includes(cue))) continue;

      out.push({
        ruleId: "tools/destructive-no-confirm",
        severity: "error",
        message: `Destructive verb "${verb}" appears without a confirmation / human-gate cue — the agent will happily run this unattended.`,
        range: rule.range,
        data: { verb },
      });
    }
    return out;
  },
};

function containsWord(haystack: string, needle: string): boolean {
  const pattern = new RegExp(`(?:^|\\W)${escapeRegex(needle)}(?:\\W|$)`, "i");
  return pattern.test(haystack);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
