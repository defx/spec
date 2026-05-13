import type {
  ActionEffect,
  AssignEffect,
  Condition,
  Effect,
  InterpretationDocument,
  StateNode,
  Transition,
  XStateActionDescriptor,
  XStateMachineConfig,
  XStateStateConfig,
  XStateTransitionConfig
} from "./types.js";

export function buildXStateMachine(interpretation: InterpretationDocument): XStateMachineConfig {
  const model = interpretation.model;

  return {
    id: model.id,
    initial: model.initial,
    context: buildInitialContext(model.context ?? {}),
    states: buildStates(model.states, model.transitions ?? []),
    meta: {
      source: "spec-interpretation",
      interpretation: {
        name: interpretation.name,
        status: interpretation.status,
        description: interpretation.description
      },
      invariants: interpretation.invariants ?? []
    }
  };
}

function buildInitialContext(context: NonNullable<InterpretationDocument["model"]["context"]>): XStateMachineConfig["context"] {
  return Object.fromEntries(Object.entries(context).map(([key, entry]) => [key, entry.initial]));
}

function buildStates(states: StateNode[], transitions: Transition[]): Record<string, XStateStateConfig> {
  return Object.fromEntries(states.map((state) => [state.id, buildState(state, transitions)]));
}

function buildState(state: StateNode, transitions: Transition[]): XStateStateConfig {
  const childStates = state.states && state.states.length > 0 ? buildStates(state.states, transitions) : undefined;
  const stateConfig: XStateStateConfig = {
    meta: {
      name: state.name,
      description: state.description,
      status: state.status,
      sourceRefs: state.sourceRefs ?? []
    }
  };

  if (state.type === "final" || state.type === "parallel") {
    stateConfig.type = state.type;
  }

  if (state.initial) {
    stateConfig.initial = state.initial;
  }

  if (childStates) {
    stateConfig.states = childStates;
  }

  if (state.tags && state.tags.length > 0) {
    stateConfig.tags = state.tags;
  }

  const outgoing = transitions.filter((transition) => transition.from === state.id);
  const on = buildOn(outgoing);

  if (Object.keys(on).length > 0) {
    stateConfig.on = on;
  }

  return stateConfig;
}

function buildOn(transitions: Transition[]): NonNullable<XStateStateConfig["on"]> {
  const grouped = new Map<string, XStateTransitionConfig[]>();

  for (const transition of transitions) {
    const eventTransitions = grouped.get(transition.event) ?? [];
    eventTransitions.push(buildTransition(transition));
    grouped.set(transition.event, eventTransitions);
  }

  return Object.fromEntries(
    Array.from(grouped.entries()).map(([event, eventTransitions]) => [
      event,
      eventTransitions.length === 1 ? eventTransitions[0]! : eventTransitions
    ])
  );
}

function buildTransition(transition: Transition): XStateTransitionConfig {
  const config: XStateTransitionConfig = {
    meta: {
      id: transition.id,
      name: transition.name,
      status: transition.status,
      sourceRefs: transition.sourceRefs
    }
  };

  if (transition.to) {
    config.target = transition.to;
  }

  if (transition.guard) {
    config.guard = buildGuard(transition.guard);
  }

  const actions = (transition.effects ?? []).map(buildAction);

  if (actions.length > 0) {
    config.actions = actions;
  }

  return config;
}

function buildGuard(condition: Condition): XStateTransitionConfig["guard"] {
  return {
    type: "spec.condition",
    params: { condition }
  };
}

function buildAction(effect: Effect): XStateActionDescriptor {
  if (isAssignEffect(effect)) {
    return {
      type: "spec.assign",
      params: effect
    };
  }

  const action = effect as ActionEffect;
  return {
    type: action.action,
    params: action.params
  };
}

function isAssignEffect(effect: Effect): effect is AssignEffect {
  return "assign" in effect;
}
