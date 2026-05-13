import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Ajv2020, type AnySchema, type ErrorObject } from "ajv/dist/2020.js";

import { defaultSchemaPath } from "./paths.js";
import type { ValidationError, ValidationResult } from "./types.js";

const allowedSourceRefKeys = new Set(["scenario", "phase", "clause"]);

export async function validateInterpretation(data: unknown, options: { schemaPath?: string } = {}): Promise<ValidationResult> {
  const schemaPath = options.schemaPath ? resolve(options.schemaPath) : defaultSchemaPath;
  const schema = JSON.parse(await readFile(schemaPath, "utf8")) as unknown;
  const errors = [...validateAgainstSchema(data, schema), ...validateStructure(data)];

  return { ok: errors.length === 0, errors };
}

export function validateAgainstSchema(data: unknown, schema: unknown): ValidationError[] {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema as AnySchema);

  if (validate(data)) {
    return [];
  }

  return (validate.errors ?? []).map((error: ErrorObject) => ({
    path: ajvErrorPath(error),
    message: ajvErrorMessage(error)
  }));
}

export function validateStructure(data: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const model = isRecord(data) ? data.model : undefined;

  validateNotes(data, errors);
  validateSourceRefs(data, "$", errors);

  if (!isRecord(model)) {
    return errors;
  }

  const contextKeys = new Set(Object.keys(isRecord(model.context) ? model.context : {}));
  const states = collectStateIds(model.states);
  const events = new Set(readIds(model.events));

  if (typeof model.initial === "string" && !states.has(model.initial)) {
    errors.push({
      path: "$.model.initial",
      message: `State "${model.initial}" is not defined in model.states`
    });
  }

  validateTransitions(model.transitions, contextKeys, states, events, errors);
  validateInvariants(isRecord(data) ? data.invariants : undefined, contextKeys, states, errors);

  return errors;
}

function validateNotes(data: unknown, errors: ValidationError[]): void {
  if (!isRecord(data) || !Object.hasOwn(data, "notes")) {
    return;
  }

  if (!Array.isArray(data.notes)) {
    errors.push({ path: "$.notes", message: "notes must be an array of strings" });
    return;
  }

  data.notes.forEach((note, index) => {
    if (typeof note !== "string") {
      errors.push({ path: `$.notes[${index}]`, message: "notes entries must be strings" });
    }
  });
}

function validateSourceRefs(value: unknown, path: string, errors: ValidationError[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateSourceRefs(item, `${path}[${index}]`, errors));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (Object.hasOwn(value, "sourceRefs")) {
    const sourceRefsPath = `${path}.sourceRefs`;
    if (!Array.isArray(value.sourceRefs)) {
      errors.push({ path: sourceRefsPath, message: "sourceRefs must be an array" });
    } else {
      value.sourceRefs.forEach((sourceRef, index) => {
        if (!isRecord(sourceRef)) {
          return;
        }

        for (const key of Object.keys(sourceRef)) {
          if (!allowedSourceRefKeys.has(key)) {
            errors.push({
              path: `${sourceRefsPath}[${index}].${key}`,
              message: "sourceRefs may only contain scenario, phase, and clause"
            });
          }
        }
      });
    }
  }

  for (const [key, child] of Object.entries(value)) {
    validateSourceRefs(child, appendPath(path, key), errors);
  }
}

function validateTransitions(
  transitions: unknown,
  contextKeys: Set<string>,
  states: Set<string>,
  events: Set<string>,
  errors: ValidationError[]
): void {
  if (!Array.isArray(transitions)) {
    return;
  }

  transitions.forEach((transition, index) => {
    const transitionPath = `$.model.transitions[${index}]`;
    if (!isRecord(transition)) {
      return;
    }

    if (typeof transition.from === "string" && !states.has(transition.from)) {
      errors.push({
        path: `${transitionPath}.from`,
        message: `State "${transition.from}" is not defined in model.states`
      });
    }

    if (typeof transition.to === "string" && !states.has(transition.to)) {
      errors.push({
        path: `${transitionPath}.to`,
        message: `State "${transition.to}" is not defined in model.states`
      });
    }

    if (typeof transition.event === "string" && !events.has(transition.event)) {
      errors.push({
        path: `${transitionPath}.event`,
        message: `Event "${transition.event}" is not defined in model.events`
      });
    }

    validateCondition(transition.guard, `${transitionPath}.guard`, contextKeys, states, errors);

    if (Array.isArray(transition.effects)) {
      transition.effects.forEach((effect, effectIndex) => {
        validateEffect(effect, `${transitionPath}.effects[${effectIndex}]`, contextKeys, errors);
      });
    }
  });
}

function validateInvariants(invariants: unknown, contextKeys: Set<string>, states: Set<string>, errors: ValidationError[]): void {
  if (!Array.isArray(invariants)) {
    return;
  }

  invariants.forEach((invariant, index) => {
    const invariantPath = `$.invariants[${index}]`;
    if (!isRecord(invariant)) {
      return;
    }

    validateCondition(invariant.when, `${invariantPath}.when`, contextKeys, states, errors);

    if (Array.isArray(invariant.assert)) {
      invariant.assert.forEach((condition, conditionIndex) => {
        validateCondition(condition, `${invariantPath}.assert[${conditionIndex}]`, contextKeys, states, errors);
      });
    }
  });
}

function validateCondition(
  condition: unknown,
  path: string,
  contextKeys: Set<string>,
  states: Set<string>,
  errors: ValidationError[]
): void {
  if (!isRecord(condition)) {
    return;
  }

  if (typeof condition.state === "string" && !states.has(condition.state)) {
    errors.push({ path: `${path}.state`, message: `State "${condition.state}" is not defined in model.states` });
  }

  if (typeof condition.context === "string" && !contextKeys.has(condition.context)) {
    errors.push({ path: `${path}.context`, message: `Context "${condition.context}" is not defined in model.context` });
  }

  if (Array.isArray(condition.all)) {
    condition.all.forEach((child, index) => validateCondition(child, `${path}.all[${index}]`, contextKeys, states, errors));
  }

  if (Array.isArray(condition.any)) {
    condition.any.forEach((child, index) => validateCondition(child, `${path}.any[${index}]`, contextKeys, states, errors));
  }

  if (Object.hasOwn(condition, "not")) {
    validateCondition(condition.not, `${path}.not`, contextKeys, states, errors);
  }
}

function validateEffect(effect: unknown, path: string, contextKeys: Set<string>, errors: ValidationError[]): void {
  if (!isRecord(effect)) {
    return;
  }

  if (typeof effect.assign === "string" && !contextKeys.has(effect.assign)) {
    errors.push({ path: `${path}.assign`, message: `Context "${effect.assign}" is not defined in model.context` });
  }
}

function collectStateIds(states: unknown): Set<string> {
  const ids = new Set<string>();
  collectStateIdsInto(states, ids);
  return ids;
}

function collectStateIdsInto(states: unknown, ids: Set<string>): void {
  if (!Array.isArray(states)) {
    return;
  }

  for (const state of states) {
    if (!isRecord(state)) {
      continue;
    }

    if (typeof state.id === "string") {
      ids.add(state.id);
    }

    collectStateIdsInto(state.states, ids);
  }
}

function readIds(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item) => (isRecord(item) && typeof item.id === "string" ? [item.id] : []));
}

function ajvErrorPath(error: ErrorObject): string {
  let path = jsonPointerToPath(error.instancePath);

  if (error.keyword === "required" && typeof error.params?.missingProperty === "string") {
    path = appendPath(path, error.params.missingProperty);
  }

  if (error.keyword === "additionalProperties" && typeof error.params?.additionalProperty === "string") {
    path = appendPath(path, error.params.additionalProperty);
  }

  return path;
}

function ajvErrorMessage(error: ErrorObject): string {
  if (error.keyword === "required" && typeof error.params?.missingProperty === "string") {
    return `Missing required property "${error.params.missingProperty}"`;
  }

  if (error.keyword === "additionalProperties" && typeof error.params?.additionalProperty === "string") {
    return `Unexpected property "${error.params.additionalProperty}"`;
  }

  return error.message ?? `Schema validation failed for keyword "${error.keyword}"`;
}

function jsonPointerToPath(pointer: string): string {
  if (!pointer) {
    return "$";
  }

  return pointer
    .split("/")
    .slice(1)
    .reduce((path, segment) => appendPath(path, segment.replaceAll("~1", "/").replaceAll("~0", "~")), "$");
}

function appendPath(path: string, key: string): string {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return `${path}.${key}`;
  }

  return `${path}[${JSON.stringify(key)}]`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
