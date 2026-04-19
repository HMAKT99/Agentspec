import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PlaygroundShell } from "@/components/playground-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Paste an agent spec and see mdpact diagnostics in your browser. No network, no uploads.",
};

const SAMPLE = `---
version: 1
owner: platform-team
---

# CLAUDE.md

## Commit discipline

- You must always commit before pushing.
- Never commit before pushing.

## Style

- Always follow our standards.
- Try to consider using single quotes.
`;

export default function PlaygroundPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
          <p className="mt-1 text-sm text-[color:var(--color-fg-muted)]">
            Paste a spec on the left. Diagnostics render live on the right — runs entirely in your
            browser.
          </p>
        </header>
        <PlaygroundShell initialSpec={SAMPLE} />
      </main>
      <Footer />
    </>
  );
}
