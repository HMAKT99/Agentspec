import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EditorShell } from "@/components/editor/editor-shell";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor",
  description:
    "Write, view, and review agent specs with a live attention heatmap and structured diagnostics. No network, no uploads.",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const BAD_SPEC_PATH = join(__dirname, "../../../../../examples/bad-claude.md");

function loadSample(): string {
  try {
    return readFileSync(BAD_SPEC_PATH, "utf8");
  } catch {
    return "# CLAUDE.md\n\nPaste your spec here.\n";
  }
}

export default function EditorPage() {
  const sample = loadSample();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-10 pt-6">
        <header className="mb-4 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Editor</h1>
          <p className="text-sm text-[color:var(--color-fg-muted)]">
            Write on the left. Visualize on the right. Five lenses on the same parsed spec —
            heatmap, outline, preview, review, problems. Runs entirely in your browser.
          </p>
        </header>
        <EditorShell initialSpec={sample} />
      </main>
      <Footer />
    </>
  );
}
