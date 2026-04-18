import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { CacheKey, CacheProvider, CachedEntry } from "./types.js";

export class NullCache implements CacheProvider {
  async get(): Promise<CachedEntry | null> {
    return null;
  }
  async set(): Promise<void> {
    return;
  }
}

export class DiskCache implements CacheProvider {
  constructor(readonly dir: string) {}

  private pathFor(key: CacheKey): string {
    const hash = hashKey(key);
    return join(this.dir, hash.slice(0, 2), `${hash}.json`);
  }

  async get(key: CacheKey): Promise<CachedEntry | null> {
    const path = this.pathFor(key);
    if (!existsSync(path)) return null;
    try {
      return JSON.parse(readFileSync(path, "utf8")) as CachedEntry;
    } catch {
      return null;
    }
  }

  async set(key: CacheKey, value: CachedEntry): Promise<void> {
    const path = this.pathFor(key);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(value), "utf8");
  }
}

export function hashKey(key: CacheKey): string {
  const h = createHash("sha256");
  h.update(digest(key.spec));
  h.update("|");
  h.update(digest(key.task));
  h.update("|");
  h.update(key.model);
  h.update("|");
  h.update(key.modelVersion);
  h.update("|");
  h.update(String(key.run));
  return h.digest("hex");
}

function digest(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
