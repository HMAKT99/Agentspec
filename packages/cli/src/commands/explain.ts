import { allRules } from "@agentspec/rules";
import { defineCommand } from "citty";
import pc from "picocolors";

export const explainCommand = defineCommand({
  meta: {
    name: "explain",
    description: "Show rule metadata and documentation link",
  },
  args: {
    rule: {
      type: "positional",
      required: true,
      description: "Rule id (e.g. conflict/binding)",
    },
  },
  async run({ args }) {
    const id = String(args.rule);
    const rule = allRules.find((r) => r.id === id);

    if (!rule) {
      process.stderr.write(`Unknown rule: ${id}\n`);
      process.stderr.write(`Known rules: ${allRules.map((r) => r.id).join(", ")}\n`);
      process.exit(1);
    }

    const severityColor =
      rule.severity === "error"
        ? pc.red(rule.severity)
        : rule.severity === "warning"
          ? pc.yellow(rule.severity)
          : pc.cyan(rule.severity);

    process.stdout.write(`${pc.bold(rule.id)}\n`);
    process.stdout.write(`${pc.dim("category:")} ${rule.category}\n`);
    process.stdout.write(`${pc.dim("severity:")} ${severityColor}\n`);
    process.stdout.write(`${pc.dim("fixable: ")} ${rule.fixable || "no"}\n`);
    process.stdout.write(`${pc.dim("docs:    ")} ${rule.docsUrl}\n`);
    process.stdout.write(`\n${rule.description}\n`);
  },
});
