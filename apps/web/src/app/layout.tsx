import type { Metadata } from "next";
import { JetBrains_Mono, VT323 } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hmakt99.github.io/Agentspec"),
  title: {
    default: "mdpact — the missing layer between your markdown and your agents",
    template: "%s · mdpact",
  },
  description:
    "mdpact lints, tests, and scores CLAUDE.md / AGENTS.md / Copilot / Cursor / Windsurf / Cline / Aider / MCP specs so you stop shipping contradictions to your agents.",
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
    <html lang="en" className={`${jetbrainsMono.variable} ${vt323.variable}`}>
      <body>{children}</body>
    </html>
  );
}
