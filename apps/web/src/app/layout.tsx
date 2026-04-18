import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agentspec.dev"),
  title: {
    default: "AgentSpec — the missing layer between your markdown and your agents",
    template: "%s · AgentSpec",
  },
  description:
    "AgentSpec lints, tests, and scores CLAUDE.md / AGENTS.md / MCP tool specs so you stop shipping contradictions to your agents.",
  openGraph: {
    title: "AgentSpec",
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
