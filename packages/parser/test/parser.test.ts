import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, it } from "node:test";

import {
  parseSpec,
  SPEC_AST_VERSION,
  SPEC_GRAMMAR_NAME,
  SPEC_GRAMMAR_VERSION,
  SpecParseError
} from "../dist/index.js";
import type { SpecAst } from "../dist/index.js";


const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const fixturePath = join(repoRoot, "examples/shopping-basket/shopping-basket.spec");
const cliPath = resolve(__dirname, "../dist/cli.js");

describe("parseSpec", () => {
  it("parses the shopping basket example into canonical source-ordered blocks", async () => {
    const source = await readFile(fixturePath, "utf8");
    const ast = parseSpec(source, { path: fixturePath });

    assert.equal(ast.kind, "spec-ast");
    assert.equal(ast.version, SPEC_AST_VERSION);
    assert.deepEqual(ast.grammar, {
      name: SPEC_GRAMMAR_NAME,
      version: SPEC_GRAMMAR_VERSION
    });
    assert.equal(ast.source.path, fixturePath);
    assert.equal(ast.blocks.length, 13);
    assertShapeKindConsistency(ast);

    assert.deepEqual(
      ast.blocks.map((block) => block.title),
      [
        "Add a product to an empty basket",
        "Add a second product to the basket",
        "Increase the quantity of an existing product",
        "Decrease the quantity of a product",
        "Remove a product when its quantity reaches zero",
        "Remove a product from the basket",
        "Apply a valid promo code",
        "Reject an invalid promo code",
        "Start checkout from a non-empty basket",
        "Checkout button is disabled for an empty basket",
        "Checkout button is enabled for a non-empty basket",
        "Basket total equals the sum of all products",
        "Basket total reflects discount when a promo code is applied"
      ]
    );

    const first = ast.blocks[0];
    assert.ok(first)
    assert.equal(first.shape, "given-when-then");
    assert.equal(first.kind, "transition");
    assert.deepEqual(first.comments, []);
    assert.deepEqual(first.given[0], {
      keyword: "Given",
      phase: "given",
      text: "basket is empty",
      span: {
        start: { line: 3, column: 1 },
        end: { line: 3, column: 22 }
      }
    });
    assert.deepEqual(first.when[0], {
      keyword: "When",
      phase: "when",
      text: "the user adds product to basket",
      span: {
        start: { line: 4, column: 1 },
        end: { line: 4, column: 37 }
      }
    });
    assert.deepEqual(
      first.then.map((clause) => [clause.keyword, clause.phase, clause.text]),
      [
        ["Then", "then", "basket contains product"],
        ["And", "then", "basket count equals 1"],
        ["And", "then", "basket total equals product price"]
      ]
    );

    const invariant = ast.blocks[9];
    assert.ok(invariant)
    assert.equal(invariant.shape, "given-then");
    assert.equal(invariant.kind, "invariant");
    assert.equal(invariant.when.length, 0);
  });

  it("parses comments, a title, and a when-then transition", () => {
    const ast = parseSpec(`# comment one
  # comment two
Scenario: Submit search

When user submits search
Then results are shown
`, { path: "inline.spec" });

    assert.equal(ast.blocks.length, 1);
    assert.deepEqual(ast.blocks[0]?.comments, ["# comment one", "  # comment two"]);
    assert.equal(ast.blocks[0].title, "Submit search");
    assert.equal(ast.blocks[0].shape, "when-then");
    assert.equal(ast.blocks[0].kind, "transition");
    assert.deepEqual(ast.blocks[0].when.map((clause) => clause.text), ["user submits search"]);
    assert.deepEqual(ast.blocks[0].then.map((clause) => clause.text), ["results are shown"]);
    assert.deepEqual(ast.blocks[0].span, {
      start: { line: 1, column: 1 },
      end: { line: 6, column: 23 }
    });
  });

  it("parses structural keywords case-insensitively", () => {
    const ast = parseSpec(`scenario: Toggle playback

given that playback is paused
wHeN the play button is pressed
THEN playback is playing

GIVEN that playback is playing
when the pause button is pressed
then playback is paused
and playback position is retained
`);

    assert.equal(ast.blocks.length, 2);
    assert.equal(ast.blocks[0]?.title, "Toggle playback");
    assert.equal(ast.blocks[0]?.given[0]?.keyword, "Given");
    assert.equal(ast.blocks[0]?.when[0]?.keyword, "When");
    assert.equal(ast.blocks[0]?.then[0]?.keyword, "Then");
    assert.deepEqual(
      ast.blocks[1]?.then.map((clause) => clause.keyword),
      ["Then", "And"]
    );
    assert.deepEqual(
      ast.blocks.map((block) => block.shape),
      ["given-when-then", "given-when-then"]
    );
  });

  it("reports line and column for invalid syntax", () => {
    assert.throws(
      () => parseSpec("Given basket is empty\nWhen user checks out\n", { path: "bad.spec" }),
      (error) => {
        assert.ok(error instanceof SpecParseError);
        assert.equal(error.line, 2);
        assert.equal(error.column, 21);
        assert.match(error.message, /bad\.spec:2:21: Expected a Then section\./);
        assert.deepEqual(error.span, {
          start: { line: 2, column: 21 },
          end: { line: 2, column: 22 }
        });
        return true;
      }
    );
  });

  it("rejects And before a section", () => {
    assert.throws(
      () => parseSpec("And basket is empty\nThen checkout is disabled\n"),
      /1:1: Expected Given, When, or Then before And\./
    );
  });

  it("rejects empty clause text", () => {
    assert.throws(
      () => parseSpec("Given \nThen checkout is disabled\n"),
      /1:7: Expected clause text\./
    );
  });

  it("rejects missing blank lines between blocks", () => {
    assert.throws(
      () => parseSpec("When user checks out\nThen checkout starts\nWhen user pays\nThen payment is accepted\n"),
      /3:1: Expected a blank line after spec block\./
    );
  });

  it("accepts indented spec text", () => {
        const ast = parseSpec(`given that playback is playing
            when the pause button is pressed
            then playback is paused
        `)
        assert.equal(ast.blocks.length, 1);
  })
  it("accepts a leading new line", () => {
        const ast = parseSpec(`
          given that playback is playing
          when the pause button is pressed
          then playback is paused
        `)
        assert.equal(ast.blocks.length, 1);
  })
});

function assertShapeKindConsistency(ast: SpecAst) {
  for (const block of ast.blocks) {
    assert.equal(block.kind, block.shape === "given-then" ? "invariant" : "transition");

    for (const clause of block.given) {
      assert.equal(clause.phase, "given");
    }

    for (const clause of block.when) {
      assert.equal(clause.phase, "when");
    }

    for (const clause of block.then) {
      assert.equal(clause.phase, "then");
    }
  }
}

describe("CLI", () => {
  it("prints pretty JSON to stdout", async () => {
    const { stdout } = await execFileAsync(process.execPath, [cliPath, "parse", fixturePath, "--pretty"]);
    const ast = JSON.parse(stdout);

    assert.equal(stdout.endsWith("\n"), true);
    assert.equal(ast.kind, "spec-ast");
    assert.equal(ast.blocks.length, 13);
  });

  it("writes JSON with --out", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "spec-parser-"));
    const outPath = join(tempDir, "shopping-basket.ast.json");

    try {
      const { stdout, stderr } = await execFileAsync(process.execPath, [cliPath, "parse", fixturePath, "--out", outPath]);
      assert.equal(stdout, "");
      assert.equal(stderr, `Wrote AST to ${outPath}\n`);

      const ast = JSON.parse(await readFile(outPath, "utf8"));
      assert.equal(ast.kind, "spec-ast");
      assert.equal(ast.blocks.length, 13);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe("grammar metadata", () => {
  it("keeps the packaged parser grammar snapshot synced with the root grammar", async () => {
    const rootGrammar = await readFile(join(repoRoot, "grammar/spec.ebnf"), "utf8");
    const parserGrammar = await readFile(resolve(__dirname, "../grammar/spec.ebnf"), "utf8");
    assert.equal(parserGrammar, rootGrammar);

    const rootMetadata = await readFile(join(repoRoot, "grammar/grammar.json"), "utf8");
    const parserMetadata = await readFile(resolve(__dirname, "../grammar/grammar.json"), "utf8");
    assert.equal(parserMetadata, rootMetadata);
  });

  it("exports constants matching the packaged grammar metadata", async () => {
    const metadata = JSON.parse(await readFile(resolve(__dirname, "../grammar/grammar.json"), "utf8"));

    assert.equal(SPEC_GRAMMAR_NAME, metadata.name);
    assert.equal(SPEC_GRAMMAR_VERSION, metadata.version);
    assert.equal(SPEC_AST_VERSION, 1);
  });
});
