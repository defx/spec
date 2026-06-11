import { BlockNode, SpecAst } from "@defx/spec-parser"

export type SpecDiff = {
    blocks: Record<string, BlockNode>
}

export function diffSpec(nextAst: SpecAst, idCache: string[] = [], previousAst?: SpecAst): SpecDiff {
    // ...
    return {
        blocks: Object.fromEntries(nextAst.blocks.map((block) => [block.id, block]))
    }
}
