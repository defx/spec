import { BlockNode, SpecAst } from "@defx/spec-parser"

export type SpecDiff = {
    blocks: Record<string, BlockNode>
}

export function diffSpec(nextAst: SpecAst, previousAst?: SpecAst): SpecDiff {
    const previousBlockIds = new Set(previousAst?.blocks.map((block) => block.id) ?? [])
    const changedBlocks = nextAst.blocks.filter((block) => !previousBlockIds.has(block.id))

    return {
        blocks: Object.fromEntries(changedBlocks.map((block) => [block.id, block]))
    }
}
