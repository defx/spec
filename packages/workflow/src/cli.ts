#!/usr/bin/env node
import { readFile } from "node:fs/promises"
import { Command } from "commander";
import { parseSpec } from "@defx/spec-parser"
import { diffSpec } from "./diff.js";

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

    console.log({ options, path})

    // const specSource = await readFile(path, "utf8")
    // const nextAst = parseSpec(specSource)
    // ...
    return 0
}

main().then(code => process.exitCode = code)