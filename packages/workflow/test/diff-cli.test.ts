import { describe, test, expect, afterEach } from "vitest"
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { writeFile, readFile, rm } from "node:fs/promises"
import { fileURLToPath } from "node:url";


const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));



const cliPath = resolve(__dirname, "../src/cli.ts");

describe("diff:CLI", () => {

    const fixturePath = ("./diff.fixture.spec");
    const cachePath = `.spec/cache/${fixturePath}.json`

    afterEach(async () => {
        try {
            await rm(fixturePath)
            await rm(cachePath)
        } catch (e) {
            console.error(e)
        }
    })

    test("errors if path argument is not provided", async () => {
        try {
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

    test("persists the last AST to disk", async () => {

        // writeFile
        await writeFile(fixturePath, `
            given that playback is paused
            when the play button is pressed
            then playback is playing
        `)
        // exec command
        await execFileAsync(process.execPath, ["--import", "tsx", cliPath, fixturePath, "--pretty"]);
        // check for persisted copy
        let cachedAst = await readFile(cachePath, "utf8")
        let json = JSON.parse(cachedAst)

        expect(json.blocks.length).toBe(1)

        // writeFile with changes
        await writeFile(fixturePath, `
            given that playback is paused
            when the play button is pressed
            then playback is playing

            given that playback is playing
            when the pause button is pressed
            then playback is paused
        `)
        // exec command
        await execFileAsync(process.execPath, ["--import", "tsx", cliPath, fixturePath, "--pretty"]);
        
        // check that cache file matches the last run
        cachedAst = await readFile(cachePath, "utf8")
        json = JSON.parse(cachedAst)

        expect(json.blocks.length).toBe(2)

    })

    // test("")



    // test("writes JSON with --out") ...perhaps this should always write to a predictable place...
})

