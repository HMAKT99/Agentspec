import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "./load.js";

describe("loadConfig", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "agentspec-config-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns defaults when no config is present", async () => {
    const { config, path } = await loadConfig(dir);
    expect(path).toBeNull();
    expect(config.specs).toEqual([
      { path: "CLAUDE.md", binding: "primary" },
      { path: "AGENTS.md", binding: "secondary" },
    ]);
    expect(config.rules).toEqual({});
  });

  it("loads YAML config", async () => {
    const yaml = [
      "specs:",
      "  - path: FOO.md",
      "    binding: primary",
      "rules:",
      "  conflict/binding: error",
      "  clarity/vague-directive: warning",
      "score:",
      "  failBelow: 80",
    ].join("\n");
    writeFileSync(join(dir, "agentspec.config.yaml"), yaml);

    const { config, path } = await loadConfig(dir);
    expect(path).toMatch(/agentspec\.config\.yaml$/);
    expect(config.specs[0]!.path).toBe("FOO.md");
    expect(config.rules["conflict/binding"]).toBe("error");
    expect(config.score.failBelow).toBe(80);
  });

  it("loads JSON config", async () => {
    writeFileSync(
      join(dir, "agentspec.config.json"),
      JSON.stringify({ specs: [{ path: "X.md" }], budgets: { tokens: 5000 } }),
    );
    const { config } = await loadConfig(dir);
    expect(config.specs[0]!.path).toBe("X.md");
    expect(config.budgets.tokens).toBe(5000);
  });

  it("throws a helpful error on invalid config", async () => {
    writeFileSync(
      join(dir, "agentspec.config.json"),
      JSON.stringify({ rules: { "x/y": "super-serious" } }),
    );
    await expect(loadConfig(dir)).rejects.toThrow(ConfigError);
  });

  it("throws when explicit path is missing", async () => {
    await expect(loadConfig(dir, "does-not-exist.yaml")).rejects.toThrow(ConfigError);
  });
});
