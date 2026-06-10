import { test } from "node:test"
import assert from "node:assert"

import { parseSpec } from "../src/index.js"

test("blocks have ids", () => {
    const source = `Scenario: My scenario title

Given that playback is paused
Then the pause button is visible
And the play button is hidden
`
    const ast = parseSpec(source)

    assert.equal(ast.blocks.length, 1)

    const blockNode = ast.blocks[0]

    assert.equal(typeof blockNode?.id, "string")
})

test("blocks have stable ids", () => {
    const source = `Scenario: My scenario title

Given that playback is paused
Then the pause button is visible
And the play button is hidden
`
    const astV1 = parseSpec(source)
    const astV2 = parseSpec(`Scenario: My second scenario title

Given that playback is playing
Then the play button is visible
And the pause button is hidden ${source}`)

    assert.notEqual(astV2.blocks[0]?.id, astV2.blocks[1]?.id)
    assert.equal(astV1.blocks[0]?.id, astV2.blocks[1]?.id)

})

test("block id is based on scenario body, not the title", () => {
    const astV1 = parseSpec(`Scenario: My scenario title

Given that playback is paused
Then the pause button is visible
And the play button is hidden
`)

    const astV2 = parseSpec(`Scenario: My alternative scenario title

Given that playback is paused
Then the pause button is visible
And the play button is hidden
`)

assert.equal(astV1.blocks[0]?.id, astV2.blocks[0]?.id)


})


