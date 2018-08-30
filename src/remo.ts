import Events from "./events";
import { Registrar } from "./registrar";

export type EventContext = {
  store: Remo;
  event: any[];
  effects: { [key: string]: any };
  parent?: EventContext
  children: [];
};
export type EffectHandler = (ctx: EventContext) => void;
export type EventHandler = (state: any, ...args: any[]) => void;
export type EventWithEffectsHandler = (
  ctx: EventContext,
  ...args: any[]
) => any;

// function dispatchFxHandler(
//   store: Remo,
//   { type = "", payload = Remo.nullArgs }
// ) {
//   store.dispatch(type, payload);
// }

// function dispatchNFxHandler(
//   store: Remo,
//   effect: Array<{ type: string; payload?: any }> = []
// ) {
//   effect.forEach(({ type, payload }) => store.dispatch(type, payload));
// }

export default class Remo {
  static nullEffectMap = {};
  static nullArgs: any[] = [];
  eventLog: Array<EventContext> = []
  eventQ: Array<EventContext> = [];
  preEventCallbacks: Array<Function> = [];
  postEventCallbacks: Array<Function> = [];
  registrar: Registrar;
  events: Events;
  activeContext: EventContext;

  constructor(public state: any) {
    this.registrar = new Registrar();
    this.events = new Events(this.registrar);
  }

  on(id: string, handler: EventHandler) {
    this.events.register(
      id,
      ({ store: { state } }: EventContext, ...args: any[]) => {
        handler(state, ...args);
        return Remo.nullEffectMap;
      }
    );
  }

  fx(id: string, handler: EventWithEffectsHandler) {
    this.events.register(id, handler);
  }

  dispatch(type: string, ...args: any[]) {
    this.enqueueEvent(type, args);
    setTimeout(() => {
      this.processEvents();
    });
  }

  dispatchSync(type: string, args?: any[]) {
    this.enqueueEvent(type, args);
    this.processEvents();
  }

  registerEffectHandler(type: string, handler: EffectHandler) {
    this.registrar.registerHandler("effect", type, handler);
  }

  enqueueEvent(type: string, args = Remo.nullArgs) {
    if (!type) {
      console.warn(
        `Ignoring event with no type and args ${JSON.stringify(args)}`
      );
    }
    const nextContext: EventContext = {
      event: [type, ...args],
      store: this,
      effects: {},
      children: []
    };
    if (this.activeContext) {
      nextContext.parent = this.activeContext
      // @ts-ignore
      this.activeContext.children.push(nextContext);
    }
    this.eventQ.push(nextContext);
  }

  processEvents = () => {
    if (!this.eventQ.length) {
      return
    }
    console.group("Start Batch");
    while (this.eventQ.length) {
      const ctx = this.eventQ.shift();
      const { event } = ctx;
      const [type] = event;
      const handler = this.registrar.getHandler("event", type);
      this.processEvent(ctx, handler);
    }
    console.groupEnd();
  };

  processEvent(
    context: EventContext,
    handler: EventHandler | EventWithEffectsHandler
  ) {
    this.activeContext = context;
    const { event } = context;
    // @ts-ignore
    const [_, args = Remo.nullArgs] = event;
    this.notifyPreEventCallbacks(context);
    // @ts-ignore
    context.effects = handler(context, ...args) || Remo.nullEffectMap;
    this.processEffects(context);
    this.notifyPostEventCallbacks(context);
    if (!context.parent) {
      this.eventLog.push(context)
    }
    this.activeContext = null
  }

  processEffects = (context: EventContext) => {
    const { effects } = context;
    Object.keys(effects).forEach(effectType => {
      const handler = this.registrar.getHandler(
        "effect",
        effectType
      ) as EffectHandler;
      const effect = effects[effectType];
      // @ts-ignore
      handler(context, effect);
    });
  };

  notifyPostEventCallbacks(context: EventContext) {
    this.postEventCallbacks.forEach(cb => cb(context));
  }

  notifyPreEventCallbacks(context: EventContext) {
    this.preEventCallbacks.forEach(cb => cb(context));
  }

  addPreEventCallback(cb: Function) {
    this.preEventCallbacks.push(cb);
    return () => {
      this.preEventCallbacks = this.preEventCallbacks.filter(
        callback => callback !== cb
      );
    };
  }

  addPostEventCallback(cb: Function) {
    this.postEventCallbacks.push(cb);
    return () => {
      this.postEventCallbacks = this.postEventCallbacks.filter(
        callback => callback !== cb
      );
    };
  }
}
