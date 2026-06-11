import { BlockNode, SpecAst } from "@defx/spec-parser"

export type SpecDiff = {
    blocks: Record<string, BlockNode>
}

export function diffSpec(nextAst: SpecAst, idCache: string[] = [], previousAst?: SpecAst): SpecDiff {
    // ...
    return {
        blocks: {}
    }
}