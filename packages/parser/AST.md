# Spec Parser AST

The parser emits canonical JSON with `kind: "spec-ast"` and `version: 1`.

Spans use 1-based line and column numbers. `span.start` is inclusive and
`span.end` is exclusive, so a single-line span ending at column `12` covers
content up to column `11`.

```ts
type SpecAst = {
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

type BlockNode = {
  title: string | null;
  comments: string[];
  shape: "given-when-then" | "when-then" | "given-then";
  kind: "transition" | "invariant";
  given: ClauseNode[];
  when: ClauseNode[];
  then: ClauseNode[];
  span: SourceSpan;
};

type ClauseNode = {
  keyword: "Given" | "When" | "Then" | "And";
  phase: "given" | "when" | "then";
  text: string;
  span: SourceSpan;
};

type SourceSpan = {
  start: { line: number; column: number };
  end: { line: number; column: number };
};
```

## Notes

- `blocks` preserves source order.
- `grammar` identifies the syntax version used to parse the source. This makes
  standalone AST JSON files auditable without inspecting the parser package that
  produced them.
- `comments` contains leading block comment lines exactly as authored, without
  line endings.
- `title` contains the scenario title text after `Scenario:` and required
  whitespace.
- Clause `keyword` records the canonical structural keyword. Authored keyword
  casing is accepted case-insensitively but normalized in the AST.
- Clause `phase` records the structural section that owns the clause. This is
  especially useful for `And` clauses, whose phase is determined by placement.
- Clause `text` is opaque natural-language text. The parser does not infer
  entities, attributes, guards, effects, or other domain structures.
- Clause spans cover the full clause line, including the keyword and separating
  whitespace. Trailing horizontal whitespace before the line ending is not part
  of the canonical clause text or span.
- Block `kind` is derived structurally: `given-when-then` and `when-then` are
  `transition`; `given-then` is `invariant`.
- `shape` and `kind` intentionally duplicate some structural information for
  consumer ergonomics. They must remain consistent with the derivation above.
