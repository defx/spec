#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseSpec, SpecParseError } from "./index.js";

type CliOptions = {
  file: string;
  pretty: boolean;
  out: string | null;
};

async function main(argv: string[]): Promise<number> {
  const options = parseArgs(argv);
  const sourcePath = resolve(options.file);
  const source = await readFile(sourcePath, "utf8");
  const ast = parseSpec(source, { path: sourcePath });
  const json = JSON.stringify(ast, null, options.pretty ? 2 : 0);
  const output = options.pretty ? `${json}\n` : json;

  if (options.out) {
    const outPath = resolve(options.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, output, "utf8");
    return 0;
  }

  process.stdout.write(output);
  if (!options.pretty) {
    process.stdout.write("\n");
  }
  return 0;
}

function parseArgs(argv: string[]): CliOptions {
  const [command, ...rest] = argv;
  if (command !== "parse") {
    throw new CliUsageError("Usage: spec parse <file.spec> [--pretty] [--out <path>]");
  }

  let file: string | null = null;
  let pretty = false;
  let out: string | null = null;

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--pretty") {
      pretty = true;
      continue;
    }

    if (arg === "--out") {
      const outPath = rest[index + 1];
      if (!outPath || outPath.startsWith("--")) {
        throw new CliUsageError("Missing path after --out.");
      }
      out = outPath;
      index += 1;
      continue;
    }

    if (!arg) {
      continue;
    }

    if (arg.startsWith("--")) {
      throw new CliUsageError(`Unknown option: ${arg}`);
    }

    if (file) {
      throw new CliUsageError(`Unexpected argument: ${arg}`);
    }

    file = arg;
  }

  if (!file) {
    throw new CliUsageError("Missing .spec file path.");
  }

  return { file, pretty, out };
}

class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliUsageError";
  }
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    if (error instanceof SpecParseError || error instanceof CliUsageError) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
      return;
    }

    if (error instanceof Error) {
      process.stderr.write(`${error.name}: ${error.message}\n`);
      process.exitCode = 1;
      return;
    }

    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  });
