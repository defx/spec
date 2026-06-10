export type SourcePosition = {
  line: number;
  column: number;
};

export type SourceSpan = {
  start: SourcePosition;
  end: SourcePosition;
};

export type ClauseKeyword = "Given" | "When" | "Then" | "And";

export type ClausePhase = "given" | "when" | "then";

export type ClauseNode = {
  keyword: ClauseKeyword;
  phase: ClausePhase;
  text: string;
  span: SourceSpan;
};

export type BlockShape = "given-when-then" | "when-then" | "given-then";

export type BlockKind = "transition" | "invariant";

export type BlockNode = {
  id: string;
  title: string | null;
  comments: string[];
  shape: BlockShape;
  kind: BlockKind;
  given: ClauseNode[];
  when: ClauseNode[];
  then: ClauseNode[];
  span: SourceSpan;
};

export type SpecAst = {
  kind: "spec-ast";
  version: 1;
  grammar: {
    name: "spec";
    version: 2;
  };
  source: {
    path: string | null;
  };
  blocks: BlockNode[];
};

export type ParseSpecOptions = {
  path?: string;
};
