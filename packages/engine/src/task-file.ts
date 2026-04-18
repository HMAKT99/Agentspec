import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

import type { Task } from "./types.js";

export const taskSchema = z
  .object({
    name: z.string().min(1),
    prompt: z.string().min(1),
    tags: z.array(z.string()).optional(),
    expected: z
      .object({
        shouldAct: z.boolean().optional(),
        shouldAsk: z.boolean().optional(),
        shouldMention: z.array(z.string()).optional(),
        shouldNotMention: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export async function loadTaskFile(path: string): Promise<Task> {
  const raw = await readFile(path, "utf8");
  const ext = extname(path).toLowerCase();
  const parsed = ext === ".json" ? JSON.parse(raw) : parseYaml(raw);

  const defaultName = basename(path, ext);
  const input = { name: defaultName, ...parsed };
  return taskSchema.parse(input);
}
