import type { InlineCodeRef, Rule, RuleResult } from "@mdpact/core";

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

interface ToolMention {
  tool: string;
  ref: InlineCodeRef;
  specFile: string;
  kind: "allow" | "restrict";
}

/**
 * conflict/cross-tool-policy — a backticked tool is treated as permitted in
 * one spec file and restricted in another. Same shape as conflict/tool-policy
 * but spans multiple specs.
 */
export const crossToolPolicy: Rule = {
  id: "conflict/cross-tool-policy",
  severity: "warning",
  description: "A tool is described as permitted in one spec file and restricted in another.",
  category: "conflict",
  fixable: false,
  docsUrl: "https://mdpact.dev/rules/conflict/cross-tool-policy",

  run(ctx): RuleResult[] {
    if (ctx.allSpecs.length < 2) return [];

    const mentions: ToolMention[] = [];
    for (const s of ctx.allSpecs) {
      for (const ref of s.inlineCode) {
        const token = ref.text.trim().split(/\s+/)[0]?.toLowerCase();
        if (!token) continue;
        const lower = ref.surroundingText.toLowerCase();
        if (RESTRICT_CUES.some((c) => lower.includes(c))) {
          mentions.push({ tool: token, ref, specFile: s.file, kind: "restrict" });
        } else if (ALLOW_CUES.some((c) => lower.includes(c))) {
          mentions.push({ tool: token, ref, specFile: s.file, kind: "allow" });
        }
      }
    }

    // Group by tool, detect cases where allow & restrict mentions live in
    // *different* specs.
    const byTool = new Map<string, ToolMention[]>();
    for (const m of mentions) {
      const bag = byTool.get(m.tool) ?? [];
      bag.push(m);
      byTool.set(m.tool, bag);
    }

    const out: RuleResult[] = [];
    const emittedKeys = new Set<string>();

    for (const [tool, bag] of byTool) {
      const allowFiles = new Set(bag.filter((m) => m.kind === "allow").map((m) => m.specFile));
      const restrictFiles = new Set(
        bag.filter((m) => m.kind === "restrict").map((m) => m.specFile),
      );

      // Need the allow and restrict sides to live in *different* specs.
      const crossFile =
        [...allowFiles].some((f) => !restrictFiles.has(f) || restrictFiles.size > 1) &&
        [...restrictFiles].some((f) => !allowFiles.has(f) || allowFiles.size > 1) &&
        // And at least one allow and one restrict must live on opposite sides.
        [...allowFiles].some((af) => [...restrictFiles].some((rf) => af !== rf));

      if (!crossFile) continue;

      // Emit one finding per spec that mentions this tool.
      const specsMentioning = new Set(bag.map((m) => m.specFile));
      for (const specFile of specsMentioning) {
        if (specFile !== ctx.spec.file) continue;
        const firstHere = bag.find((m) => m.specFile === specFile);
        if (!firstHere) continue;
        const key = `${tool}|${specFile}`;
        if (emittedKeys.has(key)) continue;
        emittedKeys.add(key);

        const allowSummary = summariseFiles(allowFiles);
        const restrictSummary = summariseFiles(restrictFiles);

        out.push({
          ruleId: "conflict/cross-tool-policy",
          severity: "warning",
          message: `Tool "${tool}" is permitted in ${allowSummary} but restricted in ${restrictSummary}. Consolidate tool policy across spec files.`,
          range: firstHere.ref.range,
          data: {
            tool,
            allowedIn: [...allowFiles],
            restrictedIn: [...restrictFiles],
          },
        });
      }
    }

    return out;
  },
};

function summariseFiles(files: Set<string>): string {
  if (files.size === 0) return "(none)";
  return [...files].map(lastTwoSegments).join(", ");
}

function lastTwoSegments(path: string): string {
  const parts = path.split("/");
  return parts.slice(-2).join("/");
}
