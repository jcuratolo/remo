import Remo from "../src/remo";

describe("EventStore", () => {
  let state = {};
  let store: Remo;
  const type = "some-event";
  const payload = {};

  beforeEach(() => {
    state = {};
    store = new Remo(state);
  });

  test("Can be newed up", () => {
    const state = {};
    expect(new Remo(state)).toBeDefined();
  });

  test("Registers effect event handlers", () => {
    const myHandler = () => {};
    store.fx("my-event", myHandler);
    expect(
      store.registrar.handlers.get(store.registrar.kinds.event).get("my-event")
    ).toBe(myHandler);
  });

  test("Dispatch enqueues event for async processing", done => {
    const handler = jest.fn((stateArg, payloadArg) => {
      expect(stateArg).toBe(state);
      expect(payloadArg).toBe(payload);
      done();
    });
    store.on(type, handler);
    expect(store.eventQ.length).toBe(0);
    store.dispatch(type, payload);
    expect(store.eventQ.length).toBe(1);
    expect(handler).not.toBeCalled();
  });

  test("Dispatch enqueues events that yield effects for async processing", done => {
    const handler = jest.fn(({ store }, payloadArg) => {
      expect(store.state === state).toBeTruthy();
      expect(payload === payloadArg).toBeTruthy();
      done();
      return {};
    });
    store.fx(type, handler);
    expect(store.eventQ.length).toBe(0);
    store.dispatch(type, payload);
    expect(handler).not.toBeCalled();
    expect(store.eventQ.length).toBe(1);
  });

  test("DispatchSync processes all events immediately", () => {
    const handler = jest.fn();
    const handler2 = jest.fn();
    store.on(type, handler);
    store.fx("type-2", handler2);
    store.dispatchSync(type, payload);
    store.dispatchSync("type-2", payload);
    expect(handler).toHaveBeenCalledWith(store.state, payload);
    expect(handler2.mock.calls.length).toBe(1)
    expect(handler2.mock.calls[0][1]).toBe(payload)
    expect(handler2.mock.calls[0][0].store).toBe(store)
  });

  test("Callbacks are fired before and after an event is processed", done => {
    store.on(type, () => {});
    const preCb = jest.fn((ctx) => {
      expect(ctx.store === store).toBeTruthy();
      expect(ctx.event[0] === type).toBeTruthy();
      expect(ctx.event[1] === payload).toBeTruthy();
      expect(postCb).not.toBeCalled()    
    })
    const postCb = jest.fn((ctx) => {
      expect(ctx.store === store).toBeTruthy();
      expect(ctx.event[0] === type).toBeTruthy();
      expect(ctx.event[1] === payload).toBeTruthy();
      expect(preCb).toHaveBeenCalled()
      expect(postCb).toHaveBeenCalled()
      done();
    })

    store.addPreEventCallback(preCb);
    store.addPostEventCallback(postCb);
    store.dispatch(type, payload);
  });

  test("Removed callbacks are no longer called", () => {
    store.on(type, () => {});
    const preCb = jest.fn();
    const postCb = jest.fn();
    const preCbDisposer = store.addPreEventCallback(preCb);
    const postCbDisposer = store.addPostEventCallback(postCb);
    store.dispatchSync(type, payload);
    expect(preCb).toBeCalled();
    expect(postCb).toBeCalled();
    preCbDisposer();
    postCbDisposer();
    store.dispatchSync(type, payload);
    expect(preCb).toHaveBeenCalledTimes(1);
    expect(postCb).toHaveBeenCalledTimes(1);
  });

  test("Registered effect handlers receive effects from fx events", done => {
    const httpEffectHandler = (store, effect) => {
      expect(effect).toBe(httpEffect)
      expect(effect).not.toBe(httpEffect2);
      done();
    };
    const httpEffect = {
      method: "get",
      url: "",
      onSuccess: { type: "yay" },
      onError: { type: "nope" }
    };

    const httpEffect2 = {
      method: "post",
      url: "",
      onSuccess: { type: "yay" },
      onError: { type: "nope" }
    };

    store.registerEffectHandler("http", httpEffectHandler);
    store.on("type-2", () => {
      return { http: httpEffect2 };
    });
    store.fx(type, () => {
      return { http: httpEffect };
    });
    store.dispatch(type);
  });

  test("Dispatch effects induce dispatches after an fx event is processed", done => {
    store.fx(type, () => {
      return {
        dispatch: ["from-dispatch-effect", "X"]
      };
    });
    const handler = jest.fn((state, payload) => {
      expect(payload).toBe("X");
      done();
    });
    store.registerEffectHandler('dispatch', (context, effect) => {
      context.store.dispatch(...effect)
    })

    store.on("from-dispatch-effect", handler);
    store.dispatch(type);
  });
});
