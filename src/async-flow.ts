import { EventContext } from "./remo";

// const effect = {
//   startWith: "init-app",
//   rules: [
//     { when: "seen", event: "init-app-success", dispatch: "get-user" },
//     { when: "seen", event: "get-user-success", dispatch: "get-user-project" },
//     {
//       when: "seen",
//       event: "get-user-project-success",
//       dispatch: "get-user-schedule"
//     },
//     { when: "seen", event: "get-user-success-success", halt: true }
//   ]
// };

type AsyncFlowRuleSeen = {
  readonly when: "seen";
  readonly events: string;
  readonly dispatch: string;
  readonly halt?: boolean;
};

type AsyncFlowRule = AsyncFlowRuleSeen

type AsyncFlow = {
  readonly startWith: string;
  readonly rules: Array<AsyncFlowRule>;
};

type AsyncFlowContext = {
  readonly events: Array<string>;
  activeRuleIndex: number;
  dispose: Function;
};

// const nullAsyncFlow: AsyncFlow = {
//   startWith: "",
//   rules: []
// };

export function effectHandler({ store }: EventContext, asyncFlow: AsyncFlow) {
  const { startWith = "" } = asyncFlow;
  const flowContext: AsyncFlowContext = {
    events: [],
    activeRuleIndex: 0,
    dispose: () => {
      throw new Error("Flow context disposer called prematurely");
    }
  };

  const handler = createHandler(flowContext, asyncFlow);

  const disposer = store.addPostEventCallback(handler);
  flowContext.dispose = disposer;
  store.dispatch([startWith]);
}

function satisfiesRule(events: Array<string>, rule: AsyncFlowRule) {
  switch (rule.when) {
    case "seen":
      return events.includes(rule.events);

    // case "seen-all":
    //   return rule.events.every(ev => events.includes(ev));

    // case "seen-any":
    //   return rule.events.some(ev => events.includes(ev));

    default:
      throw new Error(`Unknown flow rule predicate type ${rule.when}`);
  }
}

const msgPrefix = `[ASYNC FLOW FX]`;
const validPredicateTypes = ["seen", "seen-all", "seen-any"];
const nullEvent = "null-event";
function validateRule({
  when,
  events = nullEvent,
  dispatch = '',
}: AsyncFlowRule) {
  if (!validPredicateTypes.includes(when)) {
    throw new Error(
      `${msgPrefix} Invalid predicate type ${when}. Predicate type must be one of ${validPredicateTypes.join(
        " "
      )}`
    );
  }

  if (events.length === 0) {
    throw new Error(`${msgPrefix} Missing trigger event in async flow`);
  }

  if (dispatch.length === 0) {
    throw new Error(`${msgPrefix} Missing event for dispatch`);
  }
}

function createHandler(
  flowContext: AsyncFlowContext,
  { rules }: AsyncFlow
) {
  return function handler({ event, store }: EventContext) {
    const { activeRuleIndex, events } = flowContext
    const activeRule = rules[activeRuleIndex];

    if (!activeRule) {
      return;
    }

    validateRule(activeRule)

    const [type] = event;
    const { when, dispatch } = activeRule;

    if (!when) {
      throw console.warn("Invalid rule encountered", activeRule);
    }

    // keep track of seen events
    events.push(type);
    // Nothing to do if rule is not satisfied
    if (!satisfiesRule(events, activeRule)) {
      return;
    }

    store.dispatch([dispatch]);

    flowContext.activeRuleIndex++;
  };
}
