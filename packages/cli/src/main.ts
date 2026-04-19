import { runMain as citRunMain, defineCommand } from "citty";
import { diffCommand } from "./commands/diff.js";
import { explainCommand } from "./commands/explain.js";
import { fixCommand } from "./commands/fix.js";
import { initCommand } from "./commands/init.js";
import { lintCommand } from "./commands/lint.js";
import { scoreCommand } from "./commands/score.js";
import { testCommand } from "./commands/test.js";

export const main = defineCommand({
  meta: {
    name: "mdpact",
    version: "0.0.1",
    description: "Lint, test, and score agent instruction files",
  },
  subCommands: {
    init: initCommand,
    lint: lintCommand,
    fix: fixCommand,
    score: scoreCommand,
    test: testCommand,
    diff: diffCommand,
    explain: explainCommand,
  },
});

export function runMain() {
  return citRunMain(main);
}
