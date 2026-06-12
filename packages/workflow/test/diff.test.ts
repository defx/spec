import { describe, test, expect } from "vitest"

import { parseSpec } from "@defx/spec-parser"
import { diffSpec } from "../src/diff.js"

describe("diffSpec", () => {

    test("returns blocks keyed by id", () => {
        const spec = `given that playback is playing
            when the pause button is pressed
            then playback is paused
        `
        const nextAST = parseSpec(spec)
        const diff = diffSpec(nextAST)
        const { id } = nextAST.blocks[0]!

        expect(nextAST.blocks.length).toBe(1)
        expect(id in diff.blocks)
        expect(diff.blocks[id]).toEqual(nextAST.blocks[0])

    })

    test("blocks that were identical in the previous AST are not included in the diff", () => {

        const previousAST = parseSpec(`
            given that playback is playing
            when the pause button is pressed
            then playback is paused
            `)

        const nextAST = parseSpec(`
            given that playback is paused
            when the play button is pressed
            then playback is playing

            given that playback is playing
            when the pause button is pressed
            then playback is paused
            `)

        const diff = diffSpec(nextAST, previousAST)
        const { id } = nextAST.blocks[0]!

        expect(Object.keys(diff.blocks).length).toBe(1)
        expect(id in diff.blocks)
        expect(diff.blocks[id]).toEqual(nextAST.blocks[0])
    })
})