import { EventHandler, EventWithEffectsHandler } from "./remo";

export type Kind = "effect" | "event";

enum Kinds {
  effect = 'effect',
  event = 'event'
}
export class Registrar {
  static kinds = Kinds
  kinds = Registrar.kinds
  handlers = new Map<Kind,Map<string, EventHandler | EventWithEffectsHandler>>()
  registerHandler(kind: Kind, id: string, handler: EventHandler | EventWithEffectsHandler) {
    if (!this.handlers.get(kind)) {
      this.handlers.set(kind, new Map())
    }

    this.handlers.get(kind).set(id, handler)
  }
  getHandler(kind: Kind, id: string): EventHandler | EventWithEffectsHandler {
    const handler = this.handlers.get(kind).get(id)
    
    if (!handler) {
      throw new Error(`No handler found for ${kind} ${id}`);
    }

    return handler
  }
}
