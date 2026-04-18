import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import { parse as parseYaml } from "yaml";
import { ZodError } from "zod";

import { type AgentSpecConfig, configSchema } from "./schema.js";

const FILENAMES = [
  "agentspec.config.ts",
  "agentspec.config.mts",
  "agentspec.config.mjs",
  "agentspec.config.js",
  "agentspec.config.cjs",
  "agentspec.config.json",
  "agentspec.config.yaml",
  "agentspec.config.yml",
  ".agentspec.yaml",
  ".agentspec.yml",
];

export class ConfigError extends Error {
  constructor(
    message: string,
    readonly configPath?: string,
  ) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface LoadResult {
  config: AgentSpecConfig;
  path: string | null;
}

export async function loadConfig(cwd: string, explicitPath?: string): Promise<LoadResult> {
  const target = explicitPath ? resolveExplicit(cwd, explicitPath) : discover(cwd);

  if (!target) {
    const fallback = configSchema.parse({});
    return { config: fallback, path: null };
  }

  const raw = await readConfig(target);
  try {
    const config = configSchema.parse(raw);
    return { config, path: target };
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ConfigError(formatZodError(err, target), target);
    }
    throw err;
  }
}

function resolveExplicit(cwd: string, p: string): string {
  const abs = isAbsolute(p) ? p : resolve(cwd, p);
  if (!existsSync(abs)) {
    throw new ConfigError(`Config file not found: ${p}`, abs);
  }
  return abs;
}

function discover(cwd: string): string | null {
  for (const name of FILENAMES) {
    const candidate = resolve(cwd, name);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function readConfig(path: string): Promise<unknown> {
  if (path.endsWith(".json")) {
    return JSON.parse(readFileSync(path, "utf8"));
  }

  if (path.endsWith(".yaml") || path.endsWith(".yml")) {
    const parsed = parseYaml(readFileSync(path, "utf8"));
    return parsed ?? {};
  }

  if (
    path.endsWith(".ts") ||
    path.endsWith(".mts") ||
    path.endsWith(".mjs") ||
    path.endsWith(".cjs") ||
    path.endsWith(".js")
  ) {
    return loadJsConfig(path);
  }

  throw new ConfigError(`Unsupported config extension: ${path}`, path);
}

async function loadJsConfig(path: string): Promise<unknown> {
  if (path.endsWith(".mjs") || path.endsWith(".js")) {
    const mod = await import(pathToFileURL(path).href);
    return unwrapDefault(mod);
  }

  const jiti = createJiti(path, { interopDefault: true });
  const mod = await jiti.import<unknown>(path);
  return unwrapDefault(mod);
}

function unwrapDefault(mod: unknown): unknown {
  if (mod && typeof mod === "object" && "default" in mod) {
    return (mod as { default: unknown }).default;
  }
  return mod;
}

function formatZodError(err: ZodError, path: string): string {
  const lines = [`Invalid config at ${path}:`];
  for (const issue of err.issues) {
    const where = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    lines.push(`  ${where}: ${issue.message}`);
  }
  return lines.join("\n");
}
