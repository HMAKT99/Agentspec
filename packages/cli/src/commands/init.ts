import { existsSync } from "node:fs";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { defineCommand } from "citty";
import pc from "picocolors";

const KNOWN_SPEC_FILES: Array<{ path: string; binding: "primary" | "secondary" | "tool-spec" }> = [
  { path: "CLAUDE.md", binding: "primary" },
  { path: "AGENTS.md", binding: "secondary" },
  { path: ".cursorrules", binding: "secondary" },
  { path: "GEMINI.md", binding: "secondary" },
  { path: ".github/copilot-instructions.md", binding: "secondary" },
];

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description: "Scaffold an agentspec.config.ts in the current directory",
  },
  args: {
    cwd: {
      type: "string",
      description: "Working directory",
      default: process.cwd(),
    },
    yes: {
      type: "boolean",
      description: "Non-interactive; write files without prompting",
    },
    force: {
      type: "boolean",
      description: "Overwrite an existing agentspec.config.ts",
    },
  },
  async run({ args }) {
    const cwd = resolve(args.cwd);
    const configPath = join(cwd, "agentspec.config.ts");

    if (existsSync(configPath) && !args.force) {
      process.stderr.write(
        `${pc.yellow("!")} ${configPath} already exists. Re-run with --force to overwrite.\n`,
      );
      process.exit(1);
    }

    const detected = KNOWN_SPEC_FILES.filter((s) => existsSync(join(cwd, s.path)));
    const specs =
      detected.length > 0 ? detected : [{ path: "CLAUDE.md", binding: "primary" as const }];

    const body = renderConfig(specs);
    await writeFile(configPath, body, "utf8");

    await ensureGitignore(cwd);

    process.stdout.write(`${pc.green("✓")} wrote ${configPath}\n`);
    if (detected.length > 0) {
      process.stdout.write(
        `  detected ${detected.length} spec file${detected.length === 1 ? "" : "s"}: ${detected.map((s) => s.path).join(", ")}\n`,
      );
    } else {
      process.stdout.write(
        "  no existing specs detected — CLAUDE.md is registered as a placeholder\n",
      );
    }
    process.stdout.write("\nNext: run `agentspec lint` to see diagnostics.\n");
  },
});

function renderConfig(specs: Array<{ path: string; binding: string }>): string {
  const specEntries = specs
    .map((s) => `    { path: "${s.path}", binding: "${s.binding}" },`)
    .join("\n");

  return `import { defineConfig } from "@agentspec/config";

export default defineConfig({
  specs: [
${specEntries}
  ],
  rules: {
    "conflict/*": "error",
  },
  budgets: {
    tokens: 10_000,
  },
  score: {
    failBelow: 70,
  },
});
`;
}

async function ensureGitignore(cwd: string): Promise<void> {
  const path = join(cwd, ".gitignore");
  const entry = ".agentspec/";

  if (!existsSync(path)) {
    await writeFile(path, `${entry}\n`, "utf8");
    return;
  }

  const current = await readFile(path, "utf8");
  if (current.split(/\r?\n/).some((line) => line.trim() === entry)) return;

  const sep = current.endsWith("\n") ? "" : "\n";
  await appendFile(path, `${sep}${entry}\n`, "utf8");
}
