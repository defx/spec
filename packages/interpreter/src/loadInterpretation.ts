import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { parseDocument } from "yaml";

import { validateInterpretation } from "./validateInterpretation.js";
import type { InterpretationDocument, LoadInterpretationOptions, ValidationError, ValidationResult } from "./types.js";

export async function loadInterpretation(filePath: string, options: LoadInterpretationOptions = {}): Promise<InterpretationDocument> {
  const resolvedFilePath = resolve(filePath);
  const data = await readInterpretationYaml(resolvedFilePath);
  const result = await validateInterpretation(data, options);

  if (!result.ok) {
    throw new InterpretationValidationError(resolvedFilePath, result.errors);
  }

  return data as InterpretationDocument;
}

export async function validateInterpretationFile(
  filePath: string,
  options: LoadInterpretationOptions = {}
): Promise<ValidationResult> {
  const resolvedFilePath = resolve(filePath);
  let data: unknown;

  try {
    data = await readInterpretationYaml(resolvedFilePath);
  } catch (error) {
    if (error instanceof InterpretationValidationError) {
      return { ok: false, errors: error.errors };
    }

    return {
      ok: false,
      errors: [{ path: "$", message: `Could not read ${resolvedFilePath}: ${error instanceof Error ? error.message : String(error)}` }]
    };
  }

  return validateInterpretation(data, options);
}

async function readInterpretationYaml(resolvedFilePath: string): Promise<unknown> {
  const source = await readFile(resolvedFilePath, "utf8");
  const document = parseDocument(source, { prettyErrors: false });
  const yamlErrors: ValidationError[] = document.errors.map((error) => ({
    path: "$",
    message: `YAML parse error: ${firstLine(error.message)}`
  }));

  if (yamlErrors.length > 0) {
    throw new InterpretationValidationError(resolvedFilePath, yamlErrors);
  }

  return document.toJSON() as unknown;
}

export class InterpretationValidationError extends Error {
  readonly filePath: string;
  readonly errors: ValidationError[];

  constructor(filePath: string, errors: ValidationError[]) {
    super(formatValidationErrors(filePath, errors));
    this.name = "InterpretationValidationError";
    this.filePath = filePath;
    this.errors = errors;
  }
}

export function formatValidationErrors(filePath: string, errors: ValidationError[]): string {
  return [`${filePath} failed validation:`, ...errors.map((error) => `  - ${error.path}: ${error.message}`)].join("\n");
}

function firstLine(message: string): string {
  return message.split("\n")[0] ?? message;
}
