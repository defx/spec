#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import { parseDocument } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const defaultSchemaPath = resolve(repoRoot, "schemas/interpretation.schema.json");
const defaultInterpretationPath = resolve(repoRoot, "examples/shopping-basket/interpretation.yml");
const allowedSourceRefKeys = new Set(["scenario", "phase", "clause"]);

export async function validateInterpretationFile(filePath, options = {}) {
  const resolvedFilePath = resolve(filePath);
  const schemaPath = options.schemaPath ? resolve(options.schemaPath) : defaultSchemaPath;
  const errors = [];
  let source;

  try {
    source = await readFile(resolvedFilePath, "utf8");
  } catch (error) {
    return {
      ok: false,
      errors: [{ path: "$", message: `Could not read ${resolvedFilePath}: ${error.message}` }]
    };
  }

  const document = parseDocument(source, { prettyErrors: false });

  for (const error of document.errors) {
    errors.push({ path: "$", message: `YAML parse error: ${firstLine(error.message)}` });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  let data;
  try {
    data = document.toJSON();
  } catch (error) {
    return {
      ok: false,
      errors: [{ path: "$", message: `YAML conversion error: ${firstLine(error.message)}` }]
    };
  }

  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  errors.push(...validateAgainstSchema(data, schema));
  errors.push(...validateStructure(data));

  return { ok: errors.length === 0, errors };
}

export function validateAgainstSchema(data, schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  if (validate(data)) {
    return [];
  }

  return validate.errors.map((error) => ({
    path: ajvErrorPath(error),
    message: ajvErrorMessage(error)
  }));
}

export function validateStructure(data) {
  const errors = [];
  const model = data?.model;

  validateNotes(data, errors);
  validateSourceRefs(data, "$", errors);

  if (!isRecord(model)) {
    return errors;
  }

  const facts = new Set(readIds(model.facts));
  const states = collectStateIds(model.states);
  const events = new Set(readIds(model.events));

  if (typeof model.initial === "string" && !states.has(model.initial)) {
    errors.push({
      path: "$.model.initial",
      message: `State "${model.initial}" is not defined in model.states`
    });
  }

  validateStates(model.states, "$.model.states", facts, errors);
  validateTransitions(model.transitions, facts, states, events, errors);
  validateInvariants(data.invariants, facts, states, errors);

  return errors;
}

function validateNotes(data, errors) {
  if (!Object.hasOwn(data ?? {}, "notes")) {
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

function validateSourceRefs(value, path, errors) {
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
              message: `sourceRefs may only contain scenario, phase, and clause`
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

function validateStates(states, path, facts, errors) {
  if (!Array.isArray(states)) {
    return;
  }

  states.forEach((state, index) => {
    const statePath = `${path}[${index}]`;
    if (!isRecord(state)) {
      return;
    }

    if (Array.isArray(state.facts)) {
      state.facts.forEach((fact, factIndex) => {
        if (typeof fact === "string" && !facts.has(fact)) {
          errors.push({
            path: `${statePath}.facts[${factIndex}]`,
            message: `Fact "${fact}" is not defined in model.facts`
          });
        }
      });
    }

    validateStates(state.states, `${statePath}.states`, facts, errors);
  });
}

function validateTransitions(transitions, facts, states, events, errors) {
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

    validateCondition(transition.guard, `${transitionPath}.guard`, facts, states, errors);

    if (Array.isArray(transition.effects)) {
      transition.effects.forEach((effect, effectIndex) => {
        validateEffect(effect, `${transitionPath}.effects[${effectIndex}]`, facts, errors);
      });
    }
  });
}

function validateInvariants(invariants, facts, states, errors) {
  if (!Array.isArray(invariants)) {
    return;
  }

  invariants.forEach((invariant, index) => {
    const invariantPath = `$.invariants[${index}]`;
    if (!isRecord(invariant)) {
      return;
    }

    validateCondition(invariant.when, `${invariantPath}.when`, facts, states, errors);

    if (Array.isArray(invariant.assert)) {
      invariant.assert.forEach((condition, conditionIndex) => {
        validateCondition(condition, `${invariantPath}.assert[${conditionIndex}]`, facts, states, errors);
      });
    }
  });
}

function validateCondition(condition, path, facts, states, errors) {
  if (!isRecord(condition)) {
    return;
  }

  if (typeof condition.fact === "string" && !facts.has(condition.fact)) {
    errors.push({ path: `${path}.fact`, message: `Fact "${condition.fact}" is not defined in model.facts` });
  }

  if (typeof condition.state === "string" && !states.has(condition.state)) {
    errors.push({ path: `${path}.state`, message: `State "${condition.state}" is not defined in model.states` });
  }

  if (Array.isArray(condition.all)) {
    condition.all.forEach((child, index) => validateCondition(child, `${path}.all[${index}]`, facts, states, errors));
  }

  if (Array.isArray(condition.any)) {
    condition.any.forEach((child, index) => validateCondition(child, `${path}.any[${index}]`, facts, states, errors));
  }

  if (Object.hasOwn(condition, "not")) {
    validateCondition(condition.not, `${path}.not`, facts, states, errors);
  }
}

function validateEffect(effect, path, facts, errors) {
  if (!isRecord(effect)) {
    return;
  }

  for (const key of ["assertFact", "clearFact"]) {
    if (typeof effect[key] === "string" && !facts.has(effect[key])) {
      errors.push({ path: `${path}.${key}`, message: `Fact "${effect[key]}" is not defined in model.facts` });
    }
  }
}

function collectStateIds(states) {
  const ids = new Set();
  collectStateIdsInto(states, ids);
  return ids;
}

function collectStateIdsInto(states, ids) {
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

function readIds(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item) => (isRecord(item) && typeof item.id === "string" ? [item.id] : []));
}

function formatErrors(filePath, errors) {
  return [`${filePath} failed validation:`, ...errors.map((error) => `  - ${error.path}: ${error.message}`)].join("\n");
}

function ajvErrorPath(error) {
  let path = jsonPointerToPath(error.instancePath);

  if (error.keyword === "required" && error.params?.missingProperty) {
    path = appendPath(path, error.params.missingProperty);
  }

  if (error.keyword === "additionalProperties" && error.params?.additionalProperty) {
    path = appendPath(path, error.params.additionalProperty);
  }

  return path;
}

function ajvErrorMessage(error) {
  if (error.keyword === "required" && error.params?.missingProperty) {
    return `Missing required property "${error.params.missingProperty}"`;
  }

  if (error.keyword === "additionalProperties" && error.params?.additionalProperty) {
    return `Unexpected property "${error.params.additionalProperty}"`;
  }

  return error.message ?? `Schema validation failed for keyword "${error.keyword}"`;
}

function jsonPointerToPath(pointer) {
  if (!pointer) {
    return "$";
  }

  return pointer
    .split("/")
    .slice(1)
    .reduce((path, segment) => appendPath(path, segment.replaceAll("~1", "/").replaceAll("~0", "~")), "$");
}

function appendPath(path, key) {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return `${path}.${key}`;
  }

  return `${path}[${JSON.stringify(key)}]`;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function firstLine(message) {
  return message.split("\n")[0];
}

async function main(args) {
  const filePaths = args.length > 0 ? args : [defaultInterpretationPath];
  let failed = false;

  for (const filePath of filePaths) {
    const result = await validateInterpretationFile(filePath);
    if (result.ok) {
      console.log(`${filePath} passed validation`);
    } else {
      failed = true;
      console.error(formatErrors(filePath, result.errors));
    }
  }

  return failed ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
