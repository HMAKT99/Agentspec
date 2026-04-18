import type { Rule } from "@agentspec/core";
import { bindingConflict } from "./conflict/binding/index.js";

export const allRules: Rule[] = [bindingConflict];

export { bindingConflict };
