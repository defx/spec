import { describe, test, expect } from "vitest"

import { parseSpec } from "@defx/spec-parser"
import { diffSpec } from "../src/diff.js"

describe("diffSpec", () => {

    test("returns blocks keyed by id", () => {
        const spec = `given that playback is playing
        when the pause button is pressed
        then playback is paused
        `
        const nextAst = parseSpec(spec)
        const diff = diffSpec(nextAst)
        const { id } = nextAst.blocks[0]!

        expect(nextAst.blocks.length).toBe(1)
        expect(id in diff.blocks)
        expect(diff.blocks[id]).toEqual(nextAst.blocks[0])

    })
})

//it("", () => {})