/**
 * End-to-end integration tests: spawn the real CLI binary against real
 * temp-dir fixtures, assert on exit code + stdout + filesystem side-effects.
 *
 * These tests require the workspace to be built. They spawn the compiled
 * binary at packages/cli/bin/mdpact.mjs which `import`s from `dist/`.
 */

import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

// packages/cli/src/__tests__ → repo root is ../../../..
const REPO_ROOT = resolve(__dirname, "../../../..");
const BIN = resolve(REPO_ROOT, "packages/cli/bin/mdpact.mjs");

async function mdpact(
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string; code: number }> {
  // Strip color env so picocolors emits plain text regardless of where this
  // runs (GitHub Actions runners set FORCE_COLOR=1 and would otherwise inject
  // ANSI escape sequences that break our string-contains assertions).
  const env = { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" };
  try {
    const { stdout, stderr } = await run("node", [BIN, ...args], {
      cwd,
      env,
      timeout: 30_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      code: typeof e.code === "number" ? e.code : 1,
    };
  }
}

describe("mdpact CLI — end-to-end", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "mdpact-e2e-"));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  describe("lint", () => {
    it("exits 0 on a clean spec", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        [
          "---",
          "version: 1",
          "owner: team",
          "---",
          "",
          "# Spec",
          "",
          "This document governs agent behavior in the repository. The binding rules below apply to any agent or developer editing code in this monorepo, regardless of which package they are touching.",
          "",
          "## Binding rules",
          "",
          "- You must always commit before pushing changes to the remote.",
          "- Always ask the reviewer for explicit approval before merging to a protected branch.",
          "",
        ].join("\n"),
      );
      const r = await mdpact(["lint", "CLAUDE.md"], tmp);
      expect(r.code).toBe(0);
      expect(r.stdout).toContain("No issues found");
    });

    it("exits 1 and reports conflict/binding on a contradicting spec", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        "---\nversion: 1\nowner: team\n---\n\n# Spec\n\n- You must always commit before pushing.\n- Never commit before pushing.\n",
      );
      const r = await mdpact(["lint", "CLAUDE.md"], tmp);
      expect(r.code).toBe(1);
      expect(r.stdout).toContain("conflict/binding");
      expect(r.stdout).toContain("Binding rules contradict");
    });

    it("emits structured JSON output shape", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        "---\nversion: 1\nowner: team\n---\n\n- You must always commit before pushing.\n- Never commit before pushing.\n",
      );
      const r = await mdpact(["lint", "CLAUDE.md", "--format", "json"], tmp);
      expect(r.code).toBe(1);
      const parsed = JSON.parse(r.stdout) as {
        errorCount: number;
        results: { ruleId: string; line: number }[];
      };
      expect(parsed.errorCount).toBe(1);
      expect(parsed.results[0]!.ruleId).toBe("conflict/binding");
      expect(parsed.results[0]!.line).toBeGreaterThan(0);
    });

    it("emits GitHub Actions annotation commands", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        "---\nversion: 1\nowner: team\n---\n\n- You must always commit before pushing.\n- Never commit before pushing.\n",
      );
      const r = await mdpact(["lint", "CLAUDE.md", "--format", "github"], tmp);
      expect(r.code).toBe(1);
      expect(r.stdout).toMatch(/^::error file=/m);
      expect(r.stdout).toContain("title=conflict/binding");
    });

    it("fires conflict/cross-binding across two spec files (glob input)", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        "---\nversion: 1\nowner: team\n---\n\n- You must always commit before pushing.\n",
      );
      writeFileSync(
        join(tmp, "AGENTS.md"),
        "---\nversion: 1\nowner: team\n---\n\n- Never commit before pushing.\n",
      );
      // citty positional args take one value; users pass a glob to lint several.
      const r = await mdpact(["lint", "*.md"], tmp);
      expect(r.code).toBe(1);
      expect(r.stdout).toContain("conflict/cross-binding");
    });
  });

  describe("score", () => {
    it("returns 100 on a clean spec with frontmatter", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        [
          "---",
          "version: 1",
          "owner: team",
          "---",
          "",
          "# Spec",
          "",
          "This document governs agent behavior in the repository. The binding rules below apply to any agent or developer editing code in this monorepo, regardless of which package they are touching.",
          "",
          "## Binding rules",
          "",
          "- You must always commit before pushing changes to the remote.",
          "- Always ask the reviewer for explicit approval before merging to a protected branch.",
          "",
        ].join("\n"),
      );
      const r = await mdpact(["score", "CLAUDE.md"], tmp);
      expect(r.code).toBe(0);
      expect(r.stdout).toContain("100/100");
    });

    it("exits 1 when score falls below --threshold", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        [
          "---",
          "version: 1",
          "owner: team",
          "---",
          "",
          "# Spec",
          "",
          "This document governs agent behavior in the repository. The binding rules below apply to any agent or developer editing code in this monorepo.",
          "",
          "## Git workflow",
          "",
          "- You must always commit before pushing changes to the remote.",
          "- Never commit before pushing changes to the remote.",
          "",
        ].join("\n"),
      );
      const r = await mdpact(["score", "CLAUDE.md", "--threshold", "95"], tmp);
      expect(r.code).toBe(1);
      // Score is 100 - 8 (conflict/binding error) = 92
      expect(r.stdout).toContain("92");
    });

    it("exits 0 when score meets --threshold", async () => {
      writeFileSync(
        join(tmp, "CLAUDE.md"),
        [
          "---",
          "version: 1",
          "owner: team",
          "---",
          "",
          "# Spec",
          "",
          "This document governs agent behavior in the repository. The binding rules below apply to any agent or developer editing code in this monorepo.",
          "",
          "## Git workflow",
          "",
          "- You must always commit before pushing changes to the remote.",
          "- Never commit before pushing changes to the remote.",
          "",
        ].join("\n"),
      );
      const r = await mdpact(["score", "CLAUDE.md", "--threshold", "70"], tmp);
      expect(r.code).toBe(0);
    });
  });

  describe("explain", () => {
    it("prints rule metadata for a known rule", async () => {
      const r = await mdpact(["explain", "conflict/binding"], tmp);
      expect(r.code).toBe(0);
      expect(r.stdout).toContain("conflict/binding");
      expect(r.stdout).toContain("category: conflict");
      expect(r.stdout).toContain("severity: error");
      expect(r.stdout).toContain("https://mdpact.dev/rules/conflict/binding");
    });

    it("exits 1 on an unknown rule id with a helpful list", async () => {
      const r = await mdpact(["explain", "does/not-exist"], tmp);
      expect(r.code).toBe(1);
      expect(r.stderr).toContain("Unknown rule");
      expect(r.stderr).toContain("conflict/binding");
    });
  });

  describe("init", () => {
    it("scaffolds an mdpact.config.ts and updates .gitignore", async () => {
      writeFileSync(join(tmp, "CLAUDE.md"), "# spec\n");
      const r = await mdpact(["init"], tmp);
      expect(r.code).toBe(0);

      const configPath = join(tmp, "mdpact.config.ts");
      expect(existsSync(configPath)).toBe(true);
      const body = readFileSync(configPath, "utf8");
      expect(body).toContain('path: "CLAUDE.md"');
      expect(body).toContain("@mdpact/config");

      const gi = readFileSync(join(tmp, ".gitignore"), "utf8");
      expect(gi).toContain(".mdpact/");
    });

    it("refuses to overwrite an existing config unless --force", async () => {
      writeFileSync(join(tmp, "mdpact.config.ts"), "// existing\n");
      const r = await mdpact(["init"], tmp);
      expect(r.code).toBe(1);
      expect(r.stderr).toContain("already exists");

      const r2 = await mdpact(["init", "--force"], tmp);
      expect(r2.code).toBe(0);
      expect(readFileSync(join(tmp, "mdpact.config.ts"), "utf8")).toContain("@mdpact/config");
    });
  });

  describe("fix", () => {
    it("adds frontmatter with --unsafe on a spec missing it", async () => {
      writeFileSync(join(tmp, "CLAUDE.md"), "# Spec\n\n- You must commit before pushing.\n");

      // Without --unsafe: no fix applied (structure/no-frontmatter is unsafe-fixable)
      const r1 = await mdpact(["fix", "CLAUDE.md"], tmp);
      expect(r1.code).toBe(0);
      expect(readFileSync(join(tmp, "CLAUDE.md"), "utf8").startsWith("#")).toBe(true);

      // With --unsafe: inserts a placeholder frontmatter block
      const r2 = await mdpact(["fix", "CLAUDE.md", "--unsafe"], tmp);
      expect(r2.code).toBe(0);
      const after = readFileSync(join(tmp, "CLAUDE.md"), "utf8");
      expect(after.startsWith("---\n")).toBe(true);
      expect(after).toContain("version: 1");
      expect(after).toContain("owner: TODO");

      // And a subsequent lint passes
      const r3 = await mdpact(["lint", "CLAUDE.md"], tmp);
      expect(r3.stdout).not.toContain("structure/no-frontmatter");
    });

    it("does not write anything on --dry-run even when fixes are applicable", async () => {
      writeFileSync(join(tmp, "CLAUDE.md"), "# Spec\n");
      const before = readFileSync(join(tmp, "CLAUDE.md"), "utf8");
      const r = await mdpact(["fix", "CLAUDE.md", "--unsafe", "--dry-run"], tmp);
      expect(r.code).toBe(0);
      expect(r.stdout).toContain("would apply");
      expect(readFileSync(join(tmp, "CLAUDE.md"), "utf8")).toBe(before);
    });
  });

  describe("top-level", () => {
    it("--help exits cleanly", async () => {
      // We verify the exit code only: citty calls process.exit(0) for help,
      // which can drop pipe-buffered stdout before the parent captures it
      // (Node stdio-flush race), so asserting on output content is flaky
      // under vitest's worker-thread spawn path. The exit code is still a
      // useful smoke signal — if someone broke --help to crash, this catches
      // it.
      const r = await mdpact(["--help"], tmp);
      expect(r.code).toBe(0);
    });

    it("lint --help exits cleanly", async () => {
      const r = await mdpact(["lint", "--help"], tmp);
      expect(r.code).toBe(0);
    });
  });
});
