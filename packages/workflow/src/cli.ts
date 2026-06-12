#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises"
import { ensureDir } from "fs-extra"
import path from "node:path";
import { Command } from "commander";
import { parseSpec } from "@defx/spec-parser"
import { diffSpec } from "./diff.js";


function cachePath(filePath: string): string {
  const parsed = path.parse(filePath);

  return path.format({
    ...parsed,
    base: "", // important: otherwise `base` overrides `name` + `ext`
    name: `.spec/cache/${parsed.name}`,
  });
}

const program = new Command();

program
    .name("my-cli")
    .description("Example CLI")
    .option("-p, --pretty", "pretty print")
    .argument("<path>", "path to .spec file")

async function main(): Promise<number> {
    program.parse();

    const options = program.opts()
    const [path] = program.args as [string] // "<path>" ensures commander will error if not defined, but commander isn't ts-first
    const specSource = await readFile(path, "utf8")
    const nextAst = parseSpec(specSource)
    const json = JSON.stringify(nextAst, null, options.pretty ? 2 : 0)
    const output = options.pretty ? `${json}\n` : json

    // check cache
    // diff

    // update cache
    await ensureDir(".spec/cache")
    await writeFile(cachePath(path), JSON.stringify(nextAst))

    process.stdout.write(output)

    return 0
}

main().then(code => process.exitCode = code)