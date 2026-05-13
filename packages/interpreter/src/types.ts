export type ReviewStatus = "proposed" | "reviewed" | "accepted";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface SourceRef {
  scenario: string;
  phase?: "given" | "when" | "then";
  clause?: string;
}

export interface SpecRef {
  path: string;
  grammar?: {
    name: "spec";
    version: number;
  };
  ast: {
    kind: "spec-ast";
    version: number;
    path?: string;
  };
}

export interface InterpretationDocument {
  kind: "spec-interpretation";
  version: 1;
  status: ReviewStatus;
  name?: string;
  description?: string;
  spec: SpecRef;
  model: InterpretationModel;
  invariants?: Invariant[];
  ambiguities?: Ambiguity[];
  notes?: string[];
}

export interface InterpretationModel {
  id: string;
  name?: string;
  description?: string;
  initial: string;
  context?: Record<string, ContextEntry>;
  states: StateNode[];
  events?: EventDefinition[];
  transitions?: Transition[];
  status?: ReviewStatus;
  sourceRefs?: SourceRef[];
}

export interface ContextEntry {
  type: "string" | "number" | "boolean" | "enum" | "expression" | "object" | "array";
  initial: JsonValue;
  description?: string;
  values?: JsonValue[];
  status?: ReviewStatus;
  sourceRefs?: SourceRef[];
}

export interface StateNode {
  id: string;
  name: string;
  type?: "atomic" | "compound" | "parallel" | "final";
  description?: string;
  initial?: string;
  states?: StateNode[];
  tags?: string[];
  status?: ReviewStatus;
  sourceRefs?: SourceRef[];
}

export interface EventDefinition {
  id: string;
  name: string;
  phrase?: string;
  description?: string;
  payload?: PayloadField[];
  status?: ReviewStatus;
  sourceRefs?: SourceRef[];
}

export interface PayloadField {
  id: string;
  name: string;
  description?: string;
}

export interface Transition {
  id: string;
  name: string;
  from: string;
  event: string;
  to?: string | null;
  guard?: Condition;
  effects?: Effect[];
  status?: ReviewStatus;
  sourceRefs: SourceRef[];
}

export type Condition = StateCondition | ContextCondition | AllCondition | AnyCondition | NotCondition;

export interface StateCondition {
  state: string;
}

export interface ContextCondition {
  context: string;
  operator:
    | "equals"
    | "notEquals"
    | "greaterThan"
    | "greaterThanOrEquals"
    | "lessThan"
    | "lessThanOrEquals"
    | "includes"
    | "doesNotInclude"
    | "exists"
    | "doesNotExist";
  value: JsonValue;
}

export interface AllCondition {
  all: Condition[];
}

export interface AnyCondition {
  any: Condition[];
}

export interface NotCondition {
  not: Condition;
}

export type Effect = AssignEffect | ActionEffect;

export interface AssignEffect {
  assign: string;
  value: JsonValue;
}

export interface ActionEffect {
  action: string;
  params?: Record<string, JsonValue>;
}

export interface Invariant {
  id: string;
  name: string;
  when: Condition;
  assert: Condition[];
  status?: ReviewStatus;
  sourceRefs: SourceRef[];
}

export interface Ambiguity {
  id: string;
  phrase: string;
  note: string;
  options?: string[];
  sourceRefs?: SourceRef[];
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}

export interface LoadInterpretationOptions {
  schemaPath?: string;
}

export interface XStateMachineConfig {
  id: string;
  initial: string;
  context: Record<string, JsonValue>;
  states: Record<string, XStateStateConfig>;
  meta?: Record<string, unknown>;
}

export interface XStateStateConfig {
  type?: "final" | "parallel";
  initial?: string;
  states?: Record<string, XStateStateConfig>;
  on?: Record<string, XStateTransitionConfig | XStateTransitionConfig[]>;
  tags?: string[];
  meta?: Record<string, unknown>;
}

export interface XStateTransitionConfig {
  target?: string;
  guard?: XStateGuardDescriptor;
  actions?: XStateActionDescriptor[];
  meta?: Record<string, unknown>;
}

export interface XStateGuardDescriptor {
  type: "spec.condition";
  params: {
    condition: Condition;
  };
}

export type XStateActionDescriptor =
  | {
      type: "spec.assign";
      params: AssignEffect;
    }
  | {
      type: string;
      params?: Record<string, JsonValue>;
    };
