import type { Root } from "mdast";
import type { z } from "zod";

export type Severity = "error" | "warning" | "info";

export type RuleCategory =
  | "conflict"
  | "clarity"
  | "tools"
  | "structure"
  | "tokens"
  | "behavior"
  | "compliance";

export type BindingKind = "binding" | "advisory" | "exception" | "informational";

export interface SourcePosition {
  file: string;
  line: number;
  column: number;
  offset?: number;
}

export interface SourceRange {
  start: SourcePosition;
  end: SourcePosition;
}

export interface ExtractedRule {
  id: string;
  kind: BindingKind;
  text: string;
  verb: string | null;
  object: string | null;
  polarity: "affirm" | "negate";
  headingPath: string[];
  range: SourceRange;
}

export interface Frontmatter {
  version?: string;
  owner?: string;
  scope?: string;
  [key: string]: unknown;
}

export interface ParsedSpec {
  file: string;
  raw: string;
  tree: Root;
  frontmatter: Frontmatter;
  extractedRules: ExtractedRule[];
  tokens: number;
}

export interface RuleContext<Options = unknown> {
  spec: ParsedSpec;
  options: Options;
  allSpecs: ParsedSpec[];
}

export interface RuleResult {
  ruleId: string;
  severity: Severity;
  message: string;
  range: SourceRange;
  data?: Record<string, unknown>;
  fixable?: boolean;
}

export interface Fix {
  range: SourceRange;
  replacement: string;
  description: string;
}

export interface Rule<Options = unknown> {
  id: string;
  severity: Severity;
  description: string;
  category: RuleCategory;
  fixable: "safe" | "unsafe" | false;
  docsUrl: string;
  schema?: z.ZodType<Options>;
  run(ctx: RuleContext<Options>): RuleResult[];
  fix?(ctx: RuleContext<Options>, result: RuleResult): Fix | null;
}

export interface LintReport {
  results: RuleResult[];
  specs: ParsedSpec[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  durationMs: number;
}

export interface SpecInput {
  path: string;
  binding?: "primary" | "secondary" | "tool-spec";
}

export interface LintConfig {
  rules?: Record<string, Severity | "off">;
  ruleOptions?: Record<string, unknown>;
}
