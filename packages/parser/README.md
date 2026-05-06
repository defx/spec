# @defx/spec-parser

Canonical parser for `.spec` files.

## Install

From the repository root:

```sh
npm install
```

## Library API

```ts
import { parseSpec } from "@defx/spec-parser";

const ast = parseSpec(source, { path: "example.spec" });
```

The AST schema is documented in [AST.md](AST.md).

The package also ships the grammar snapshot it implements in
[`grammar/spec.ebnf`](grammar/spec.ebnf), with metadata in
[`grammar/grammar.json`](grammar/grammar.json).

## Parser Guarantees

- The parser implements the repository grammar in
  [`grammar/spec.ebnf`](../../grammar/spec.ebnf).
- Parsing is syntactic only. Clause text is preserved as opaque natural language;
  the parser does not infer entities, attributes, guards, effects, or other
  domain structures.
- The JSON AST is the canonical public parser output. Public AST changes follow
  semver for `@defx/spec-parser`.
- AST output includes grammar metadata so generated JSON can be traced to the
  syntax version it was parsed against.
- Source order is preserved for blocks and clauses.
- Spans are stable, 1-based, end-exclusive, and intended for editor and tooling
  integrations.
- Parsing is deterministic and stops at the first syntax error. This first
  parser does not attempt recovery or return partial ASTs for invalid input.

## Parse Errors

Invalid syntax throws `SpecParseError`.

```ts
import { SpecParseError, parseSpec } from "@defx/spec-parser";

try {
  parseSpec(source, { path: "example.spec" });
} catch (error) {
  if (error instanceof SpecParseError) {
    console.error(error.message);
    console.error(error.line, error.column, error.span);
  }
}
```

`SpecParseError` has this public shape:

```ts
class SpecParseError extends Error {
  name: "SpecParseError";
  message: string;
  line: number;
  column: number;
  path: string | null;
  span: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}
```

The error message is formatted as:

```text
[path:]line:column: message
```

The current diagnostic span is a point span at the first detected syntax error.
CLI parse errors are printed to stderr and exit with status code `1`.

## CLI

Build the package, then run the local CLI:

```sh
npm run build --workspace @defx/spec-parser
npm run parse --workspace @defx/spec-parser -- ../../examples/shopping-basket/shopping-basket.spec --pretty
```

Write JSON to a file:

```sh
npm run parse --workspace @defx/spec-parser -- ../../examples/shopping-basket/shopping-basket.spec --pretty --out /tmp/shopping-basket.ast.json
```

When the package is installed or linked, it exposes the `spec` binary:

```sh
spec parse path/to/file.spec --pretty
spec parse path/to/file.spec --out path/to/file.ast.json
```

During package development you can also run the compiled CLI from the package
directory:

```sh
cd packages/parser
npm run parse -- ../../examples/shopping-basket/shopping-basket.spec --pretty
```

## Local Development

Use two terminals for a fast live-refresh loop:

```sh
cd packages/parser
npm run dev
```

This watches TypeScript and continuously rebuilds `dist`.

In a second terminal:

```sh
cd packages/parser
npm run dev:parse -- ../../examples/shopping-basket/shopping-basket.spec --pretty
```

`dev:parse` runs the compiled CLI with Node's watch mode, so edits that rebuild
`dist` immediately rerun the parser.

## Tests

```sh
npm test --workspace @defx/spec-parser
```

The test script builds the package first, then runs the Node test suite under
`packages/parser/test`.

## Grammar Sync

The authored grammar lives at the repository root in
[`../../grammar/spec.ebnf`](../../grammar/spec.ebnf). The parser package ships a
generated copy so published parser releases are self-contained.

From the repository root, sync the package snapshot after grammar metadata or
grammar text changes:

```sh
npm run sync:grammar
```

The test suite verifies that the parser package grammar files are byte-for-byte
identical to the root grammar files.
