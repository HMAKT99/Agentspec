import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { AgentSpecConfig } from "@agentspec/config";
import { type ParsedSpec, parseSpec } from "@agentspec/core";
import { glob } from "tinyglobby";

export interface LoadedSpecs {
  specs: ParsedSpec[];
  paths: string[];
}

export async function loadSpecs(
  cwd: string,
  config: AgentSpecConfig,
  explicitPaths: string[] = [],
): Promise<LoadedSpecs> {
  const patterns = explicitPaths.length > 0 ? explicitPaths : config.specs.map((s) => s.path);

  const files = await glob(patterns, {
    cwd: resolve(cwd),
    absolute: true,
    onlyFiles: true,
    ignore: ["**/node_modules/**", "**/dist/**", "**/.turbo/**"],
  });

  const specs = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(file, "utf8");
      return parseSpec(file, raw);
    }),
  );

  return { specs, paths: files };
}
