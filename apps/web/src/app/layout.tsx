import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mdpact.dev"),
  title: {
    default: "mdpact — the missing layer between your markdown and your agents",
    template: "%s · mdpact",
  },
  description:
    "mdpact lints, tests, and scores CLAUDE.md / AGENTS.md / MCP tool specs so you stop shipping contradictions to your agents.",
  openGraph: {
    title: "mdpact",
    description: "Lint, test, and score agent instruction files.",
    type: "website",
  },
  twitter: { card: "summary" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
