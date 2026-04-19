import { ExamplesShell } from "@/components/examples/examples-shell";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Examples",
  description:
    "Eight concrete spec patterns that AgentSpec catches or ignores — each one runs live in your browser.",
};

export default function ExamplesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Examples</h1>
          <p className="max-w-2xl text-sm text-[color:var(--color-fg-muted)]">
            Eight concrete patterns. Each input runs through the same lint pipeline used by{" "}
            <code className="font-mono">agentspec lint</code> — in your browser, no network. Click
            any example on the left to see what fires and why.
          </p>
        </header>

        <ExamplesShell />
      </main>
      <Footer />
    </>
  );
}
