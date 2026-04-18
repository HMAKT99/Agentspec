import type { Rule } from "@agentspec/core";

import { bindingConflict } from "./conflict/binding/index.js";
import { scopeOverlap } from "./conflict/scope-overlap/index.js";
import { toolPolicy } from "./conflict/tool-policy/index.js";

import { bindingAmbiguous } from "./clarity/binding-ambiguous/index.js";
import { pronounDrift } from "./clarity/pronoun-drift/index.js";
import { undefinedTerm } from "./clarity/undefined-term/index.js";
import { vagueDirective } from "./clarity/vague-directive/index.js";

import { destructiveNoConfirm } from "./tools/destructive-no-confirm/index.js";
import { missingWhen } from "./tools/missing-when/index.js";
import { unknownTool } from "./tools/unknown-tool/index.js";

import { duplicateHeading } from "./structure/duplicate-heading/index.js";
import { noFrontmatter } from "./structure/no-frontmatter/index.js";
import { noSections } from "./structure/no-sections/index.js";

import { tokensBudget } from "./tokens/budget/index.js";
import { buriedRule } from "./tokens/buried-rule/index.js";

import { missingHumanGate } from "./compliance/missing-human-gate/index.js";
import { piiInSpec } from "./compliance/pii-in-spec/index.js";
import { secretInSpec } from "./compliance/secret-in-spec/index.js";

export const allRules: Rule[] = [
  bindingConflict,
  scopeOverlap,
  toolPolicy,
  bindingAmbiguous,
  pronounDrift,
  undefinedTerm,
  vagueDirective,
  destructiveNoConfirm,
  missingWhen,
  unknownTool,
  duplicateHeading,
  noFrontmatter,
  noSections,
  buriedRule,
  tokensBudget,
  missingHumanGate,
  piiInSpec,
  secretInSpec,
];

export {
  bindingConflict,
  scopeOverlap,
  toolPolicy,
  bindingAmbiguous,
  pronounDrift,
  undefinedTerm,
  vagueDirective,
  destructiveNoConfirm,
  missingWhen,
  unknownTool,
  duplicateHeading,
  noFrontmatter,
  noSections,
  buriedRule,
  tokensBudget,
  missingHumanGate,
  piiInSpec,
  secretInSpec,
};
