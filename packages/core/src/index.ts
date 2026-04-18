export { parseSpec } from "./parse.js";
export { extractRules } from "./extract.js";
export { lint } from "./lint.js";
export type {
  BindingKind,
  ExtractedRule,
  Fix,
  Frontmatter,
  LintConfig,
  LintReport,
  ParsedSpec,
  Rule,
  RuleCategory,
  RuleContext,
  RuleResult,
  Severity,
  SourcePosition,
  SourceRange,
  SpecInput,
} from "./types.js";
export type { LintInput } from "./lint.js";
