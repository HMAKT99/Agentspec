#!/usr/bin/env node
import { runMain } from "../dist/main.js";

runMain().catch((err) => {
  console.error(err);
  process.exit(1);
});
