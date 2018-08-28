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

const nullAsyncFlow = {
  startWith: "",
  rules: []
};

function asyncFlow(store, { startWith = "", rules = [] } = nullAsyncFlow) {
  const ctx = {
    events: [],
    activeRuleIndex: 0
  };

  function handler(state, [type]) {
    const { events, activeRuleIndex } = ctx;
    const activeRule = rules[activeRuleIndex];

    if (!activeRule) {
      return store.removePostEventCallback(handler);
    }

    const { when, halt } = activeRule;

    if (halt) {
      store.removePostEventCallback(handler);
    }

    // keep track of seen events
    events.push(type);

    // Nothing to do if rule is not satisfied
    if (!satisfiesRule(events, when)) {
      return;
    }

    // get list of events and dispatch
    ruleToDispatches(rule).forEach(event => store.dispatch(...event));

    ctx.activeRuleIndex++;
  }

  store.addPostEventCallback(handler);
  store.dispatch(startWith);
}

function satisfiesRule(events, rule) {
  switch (rule.when) {
    case "seen":
      return events.includes(rule.events);

    case "seen-all":
      return rule.events.every(ev => events.includes(ev));

    case "seen-any":
      return rule.events.some(ev => events.includes(ev));

    default:
      throw new Error(`Unknown flow rule predicate type ${rule.when}`);
  }
}

function ruleToDispatches({ dispatch = [], dispatchN = [] }) {
  return [dispatch, ...dispatchN];
}

const msgPrefix = `[ASYNC FLOW FX]`;
const validPredicateTypes = ["seen", "seen-all", "seen-any"];

function validateRule({
  when = "",
  events = [],
  dispatch = [],
  dispatchN = []
}) {
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
