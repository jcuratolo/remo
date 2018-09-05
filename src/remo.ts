import Events from "./events";
import { Registrar } from "./registrar";

export type EventContext = {
  store: Remo;
  event: any[];
  effects: { [key: string]: any };
  parent?: EventContext
  children: EventContext[];
};
export type EffectHandler = (ctx: EventContext, effect: any) => void;
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
  static nullStore = new Remo({})
  static nullEffectMap = {};
  static nullEffect = {}
  static nullArgs: any[] = [];
  static nullEventContext = {
    store: Remo.nullStore,
    event: [] as any[],
    effects: Remo.nullEffectMap,
    children: [] as EventContext[]
  }
  processedEventsTree: Array<EventContext> = []
  processEventsList: Array<EventContext> = []
  eventQ: Array<EventContext> = [];
  preEventCallbacks: Array<Function> = [];
  postEventCallbacks: Array<Function> = [];
  registrar: Registrar;
  events: Events;
  activeContext: EventContext = Remo.nullEventContext;
  isProcessing: any;

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

  dispatchSync(type: string, ...args?: any[]) {
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
      event: [type].concat(args),
      store: this,
      effects: {},
      children: []
    };
    if (this.isProcessing) {
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
    this.isProcessing = true
    while (this.eventQ.length) {
      const ctx = this.eventQ.shift();
      const { event } = ctx;
      const [type] = event;
      const handler = this.registrar.getHandler(this.registrar.kinds.event, type);
      const isChildEvent = Boolean(ctx.parent)
      this.processEvent(ctx, handler);

      // Only root events appear as elements in this list
      if (!isChildEvent) {
        this.processedEventsTree.push(ctx)
      }

      // All events processed appear in this list
      this.processEventsList.push(ctx)
    }
    this.isProcessing = false
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
    context.effects = handler.apply(void 0,[context].concat(args)) || Remo.nullEffectMap;
    this.processEffects(context);
    this.notifyPostEventCallbacks(context);
    this.activeContext = null
  }

  processEffects = (context: EventContext) => {
    const { effects = {} } = context;
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

  addPreEventCallback(cb: EventCallback) {
    this.preEventCallbacks.push(cb);
    return () => {
      this.preEventCallbacks = this.preEventCallbacks.filter(
        callback => callback !== cb
      );
    };
  }

  addPostEventCallback(cb: EventCallback) {
    this.postEventCallbacks.push(cb);
    return () => {
      this.postEventCallbacks = this.postEventCallbacks.filter(
        callback => callback !== cb
      );
    };
  }
}

type EventCallback = (ctx: EventContext) => void