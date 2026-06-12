import { describe, test, expect, afterAll } from "vitest"
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { writeFile, rm, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));



const cliPath = resolve(__dirname, "../src/cli.ts");

describe("diff:CLI", () => {

const fixturePath = resolve("./diff.fixture.spec");

afterAll(async () => {
    try {
        await rm(fixturePath)
    } catch(e) {
        console.error(e)
    }
})

test("errors if path argument is not provided", async () => {
    try{
        await execFileAsync(process.execPath, ["--import", "tsx", cliPath]);
    } catch (e) {
        const { stderr, code } = e as Error & { stderr?: string, code?: number }

        expect(stderr).toMatch("missing required argument 'path")
        expect(code).toBe(1)
    }
})

test("prints pretty JSON to stdout", async () => {

    await writeFile(fixturePath, `
    given that playback is paused
    when the play button is pressed
    then playback is playing
    `)

    const { stdout } = await execFileAsync(process.execPath, ["--import", "tsx", cliPath, fixturePath, "--pretty"]);
    const output = JSON.parse(stdout);

    console.log(stdout)

    expect(stdout.endsWith("\n")).toBeTruthy()
    expect(Object.keys(output.blocks).length).toBe(1)
})

// test("persists the last AST to disk")

// test("")



    // test("writes JSON with --out") ...perhaps this should always write to a predictable place...
})

