#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises"
import { ensureDir } from "fs-extra"
import path from "node:path";
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
    const [filepath] = program.args as [string] // "<path>" ensures commander will error if not defined, but commander isn't ts-first
    const specSource = await readFile(filepath, "utf8")
    const nextAst = parseSpec(specSource)
    const cachePath = `.spec/cache/${path.basename(filepath)}.json`
    let previousAst

    

    // check cache
    try{
        previousAst = await readFile(cachePath, "utf8").then(str => JSON.parse(str))
    } catch (e: unknown) {
        if(e instanceof Error && "code" in e && e.code === "ENOENT") {
            
        }else {
            console.error(e)
        }
    }

    // diff
    const diff = diffSpec(nextAst, previousAst)
    const json = JSON.stringify(diff, null, options.pretty ? 2 : 0)
    const output = options.pretty ? `${json}\n` : json
    // update cache
    await ensureDir(".spec/cache")
    await writeFile(cachePath, JSON.stringify(nextAst))

    process.stdout.write(output)

    return 0
}

main().then(code => process.exitCode = code)