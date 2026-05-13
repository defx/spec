import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, it } from "node:test";

import YAML from "yaml";

import { validateInterpretationFile } from "../scripts/validate-interpretation.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const fixturePath = join(repoRoot, "examples/shopping-basket/interpretation.yml");
const validatorPath = join(repoRoot, "scripts/validate-interpretation.mjs");
const execFileAsync = promisify(execFile);

describe("validateInterpretationFile", () => {
  it("accepts the shopping basket interpretation example", async () => {
    const result = await validateInterpretationFile(fixturePath);

    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  });

  it("rejects invalid YAML", async () => {
    await withTempFile("kind: [\n", async (filePath) => {
      const result = await validateInterpretationFile(filePath);

      assert.equal(result.ok, false);
      assert.match(result.errors[0].message, /YAML parse error/);
    });
  });

  it("rejects schema violations", async () => {
    const data = await readFixtureData();
    delete data.kind;

    await withTempFile(YAML.stringify(data), async (filePath) => {
      const result = await validateInterpretationFile(filePath);

      assert.equal(result.ok, false);
      assertError(result, "$.kind", /Missing required property "kind"/);
    });
  });

  it("rejects transitions that reference missing events", async () => {
    const data = await readFixtureData();
    data.model.transitions[0].event = "missing-event";

    await withTempFile(YAML.stringify(data), async (filePath) => {
      const result = await validateInterpretationFile(filePath);

      assert.equal(result.ok, false);
      assertError(result, "$.model.transitions[0].event", /Event "missing-event" is not defined/);
    });
  });

  it("rejects missing context references", async () => {
    const data = await readFixtureData();
    data.model.transitions[0].effects.push({ assign: "missingContext", value: 1 });

    await withTempFile(YAML.stringify(data), async (filePath) => {
      const result = await validateInterpretationFile(filePath);

      assert.equal(result.ok, false);
      assertError(result, "$.model.transitions[0].effects[4].assign", /Context "missingContext" is not defined/);
    });
  });

  it("exits non-zero when CLI validation fails", async () => {
    await withTempFile("kind: [\n", async (filePath) => {
      await assert.rejects(
        () => execFileAsync(process.execPath, [validatorPath, filePath]),
        (error) => {
          assert.notEqual(error.code, 0);
          assert.match(error.stderr, /failed validation/);
          assert.match(error.stderr, /YAML parse error/);
          return true;
        }
      );
    });
  });
});

async function readFixtureData() {
  return YAML.parse(await readFile(fixturePath, "utf8"));
}

async function withTempFile(contents, callback) {
  const tempDir = await mkdtemp(join(tmpdir(), "interpretation-validator-"));
  const filePath = join(tempDir, "interpretation.yml");

  try {
    await writeFile(filePath, contents, "utf8");
    await callback(filePath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function assertError(result, path, messagePattern) {
  assert.ok(
    result.errors.some((error) => error.path === path && messagePattern.test(error.message)),
    `Expected error at ${path} matching ${messagePattern}, got:\n${JSON.stringify(result.errors, null, 2)}`
  );
}
