import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadTaskFile } from "./task-file.js";

describe("loadTaskFile", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mdpact-tasks-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("loads a YAML task file", async () => {
    const path = join(dir, "commit.yaml");
    writeFileSync(
      path,
      [
        "prompt: 'Push my branch to origin.'",
        "expected:",
        "  shouldMention: ['commit']",
        "tags: [git]",
      ].join("\n"),
    );

    const task = await loadTaskFile(path);
    expect(task.name).toBe("commit");
    expect(task.prompt).toBe("Push my branch to origin.");
    expect(task.expected?.shouldMention).toEqual(["commit"]);
    expect(task.tags).toEqual(["git"]);
  });

  it("loads a JSON task file", async () => {
    const path = join(dir, "deploy.json");
    writeFileSync(path, JSON.stringify({ name: "deploy", prompt: "Deploy to staging." }));
    const task = await loadTaskFile(path);
    expect(task.name).toBe("deploy");
  });

  it("rejects invalid task files", async () => {
    const path = join(dir, "broken.yaml");
    writeFileSync(path, "prompt:\n");
    await expect(loadTaskFile(path)).rejects.toThrow();
  });
});
