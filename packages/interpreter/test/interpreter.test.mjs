import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, it } from "node:test";

import YAML from "yaml";

import { buildXStateMachine, loadInterpretation, validateInterpretation } from "../dist/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..", "..");
const fixturePath = resolve(repoRoot, "examples/shopping-basket/interpretation.yml");
const rootSchemaPath = resolve(repoRoot, "schemas/interpretation.schema.json");
const bundledSchemaPath = resolve(__dirname, "..", "schemas/interpretation.schema.json");
const cliPath = resolve(__dirname, "..", "dist", "cli.js");
const execFileAsync = promisify(execFile);

describe("@defx/spec-interpreter", () => {
  it("keeps the bundled schema in sync with the repository schema", async () => {
    assert.equal(await readFile(bundledSchemaPath, "utf8"), await readFile(rootSchemaPath, "utf8"));
  });

  it("loads and validates the shopping basket interpretation", async () => {
    const interpretation = await loadInterpretation(fixturePath);

    assert.equal(interpretation.kind, "spec-interpretation");
    assert.equal(interpretation.model.id, "shopping-basket");
  });

  it("validates loaded interpretation objects", async () => {
    const interpretation = YAML.parse(await readFile(fixturePath, "utf8"));
    const result = await validateInterpretation(interpretation);

    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  });

  it("builds a serializable XState-compatible machine config", async () => {
    const interpretation = await loadInterpretation(fixturePath);
    const machine = buildXStateMachine(interpretation);

    assert.equal(machine.id, "shopping-basket");
    assert.equal(machine.initial, "empty");
    assert.deepEqual(Object.keys(machine.states), ["empty", "has-product", "has-multiple-products", "checking-out"]);
    assert.equal(machine.context.productCount, 0);
    assert.equal(machine.context.checkoutButton, "disabled");

    const addProductTransition = machine.states.empty.on?.["add-product"];

    assert.ok(addProductTransition);
    assert.ok(!Array.isArray(addProductTransition));
    assert.equal(addProductTransition.target, "has-product");
    assert.deepEqual(addProductTransition.guard, {
      type: "spec.condition",
      params: {
        condition: {
          state: "empty"
        }
      }
    });
    assert.deepEqual(addProductTransition.actions?.[0], {
      type: "spec.assign",
      params: {
        assign: "productCount",
        value: 1
      }
    });
  });

  it("groups multiple transitions for the same state and event as an array", async () => {
    const interpretation = await loadInterpretation(fixturePath);
    const machine = buildXStateMachine(interpretation);
    const transitions = machine.states["has-product"].on?.["decrease-product-quantity"];

    assert.ok(Array.isArray(transitions));
    assert.equal(transitions.length, 2);
    assert.deepEqual(
      transitions.map((transition) => transition.target),
      ["has-product", "empty"]
    );
  });

  it("rejects invalid structural references", async () => {
    const interpretation = YAML.parse(await readFile(fixturePath, "utf8"));
    interpretation.model.transitions[0].effects.push({ assign: "missingContext", value: 1 });

    const result = await validateInterpretation(interpretation);

    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(
        (error) => error.path === "$.model.transitions[0].effects[4].assign" && /missingContext/.test(error.message)
      )
    );
  });

  it("exposes a CLI that validates interpretation files", async () => {
    const result = await execFileAsync(process.execPath, [cliPath, fixturePath]);

    assert.match(result.stdout, /passed validation/);
    assert.equal(result.stderr, "");
  });

  it("exits non-zero when CLI validation fails", async () => {
    await assert.rejects(
      () => execFileAsync(process.execPath, [cliPath, rootSchemaPath]),
      (error) => {
        assert.notEqual(error.code, 0);
        assert.match(error.stderr, /failed validation/);
        assert.match(error.stderr, /Missing required property "kind"/);
        return true;
      }
    );
  });
});
