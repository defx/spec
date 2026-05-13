#!/usr/bin/env node

import { pathToFileURL } from "node:url";

import { formatValidationErrors, validateInterpretationFile } from "./index.js";

export async function main(args: string[]): Promise<number> {
  if (args.length === 0) {
    console.error("Usage: spec-interpretation <interpretation.yml> [...]");
    return 1;
  }

  let failed = false;

  for (const filePath of args) {
    const result = await validateInterpretationFile(filePath);
    if (result.ok) {
      console.log(`${filePath} passed validation`);
    } else {
      failed = true;
      console.error(formatValidationErrors(filePath, result.errors));
    }
  }

  return failed ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main(process.argv.slice(2));
}
