import { describe, test, expect } from "vitest"
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));



const cliPath = resolve(__dirname, "../src/cli.ts");

describe("diff:CLI", () => {

const fixturePath = resolve("./diff.fixture.spec");

test("errors if path argument is not provided", async () => {
    try{
        await execFileAsync(process.execPath, ["--import", "tsx", cliPath]);
    } catch (e) {
        const { stderr, code } = e as Error & { stderr?: string, code?: number }
        console.log(stderr, code)
        expect(stderr).toMatch("missing required argument 'path")
        expect(code).toBe(1)
    }
})

    // test("prints pretty JSON to stdout", async () => {

    //     await writeFile(fixturePath, `
    //     given that playback is paused
    //     when the play button is pressed
    //     then playback is playing
    //     `)

    //     const { stdout } = await execFileAsync("tsx", [cliPath, "diff", fixturePath, "--pretty"]);
    //     const output = JSON.parse(stdout);

    //     expect(stdout.endsWith("\n")).toBeTruthy()
    //     expect(Object.keys(output.blocks).length).toBe(1)
    // })

    // test("writes JSON with --out") ...perhaps this should always write to a predictable place...
})

