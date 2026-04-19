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

export interface EditorTabContext {
  text: string;
  diagnostics: Diagnostic[];
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
}

export type TabId = "heatmap" | "outline" | "preview" | "review" | "problems";

export const TAB_ORDER: { id: TabId; label: string }[] = [
  { id: "heatmap", label: "Heatmap" },
  { id: "outline", label: "Outline" },
  { id: "preview", label: "Preview" },
  { id: "review", label: "Review" },
  { id: "problems", label: "Problems" },
];
