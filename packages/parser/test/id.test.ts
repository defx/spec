import { describe, test } from "node:test"
import assert from "node:assert"

import { parseSpec } from "../src/index.js"

test("id generation", () => {
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


