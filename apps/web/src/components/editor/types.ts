export type Severity = "error" | "warning" | "info";

export interface Diagnostic {
  ruleId: string;
  severity: Severity;
  message: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

export interface FixPreview {
  /** Which diagnostic this fix resolves. References Diagnostic by array index. */
  diagnosticIndex: number;
  ruleId: string;
  description: string;
  startOffset: number;
  endOffset: number;
  replacement: string;
  safety: "safe" | "unsafe";
}

export interface EditorTabContext {
  text: string;
  diagnostics: Diagnostic[];
  fixes: FixPreview[];
  bindings: Array<{
    id: string;
    text: string;
    polarity: "affirm" | "negate";
    offset: number;
    line: number;
    column: number;
    headingPath: string[];
  }>;
  headings: Array<{ depth: number; text: string; line: number }>;
  tokens: number;
  frontmatterKeys: string[];
  /**
   * Tells the editor to move the cursor + scroll to a line.
   */
  focusLine: (line: number, column?: number) => void;
  selectedDiagnostic: number | null;
  setSelectedDiagnostic: (index: number | null) => void;
  /**
   * Apply a single fix to the spec text. Called by the Fix tab.
   */
  applyFix: (fix: FixPreview) => void;
}

export type TabId = "heatmap" | "outline" | "preview" | "review" | "problems" | "fix";

export const TAB_ORDER: { id: TabId; label: string }[] = [
  { id: "heatmap", label: "Heatmap" },
  { id: "outline", label: "Outline" },
  { id: "preview", label: "Preview" },
  { id: "review", label: "Review" },
  { id: "problems", label: "Problems" },
  { id: "fix", label: "Fix" },
];
