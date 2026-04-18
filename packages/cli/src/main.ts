import { runMain as citRunMain, defineCommand } from "citty";
import { explainCommand } from "./commands/explain.js";
import { initCommand } from "./commands/init.js";
import { lintCommand } from "./commands/lint.js";
import { scoreCommand } from "./commands/score.js";

export const main = defineCommand({
  meta: {
    name: "agentspec",
    version: "0.0.1",
    description: "Lint, test, and score agent instruction files",
  },
  subCommands: {
    init: initCommand,
    lint: lintCommand,
    score: scoreCommand,
    explain: explainCommand,
  },
});

export function runMain() {
  return citRunMain(main);
}
