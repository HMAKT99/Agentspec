import { runMain as citRunMain, defineCommand } from "citty";
import { lintCommand } from "./commands/lint.js";

export const main = defineCommand({
  meta: {
    name: "agentspec",
    version: "0.0.1",
    description: "Lint, test, and score agent instruction files",
  },
  subCommands: {
    lint: lintCommand,
  },
});

export function runMain() {
  return citRunMain(main);
}
