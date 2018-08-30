import { Registrar, Kind } from "./registrar";
import { EventHandler, EffectHandler } from "./remo";

export default class Events {
  static kind: Kind = "event";
  constructor(private registrar: Registrar) {}
  register(id: string, handler: EventHandler| EffectHandler): void {
    this.registrar.registerHandler(Events.kind, id, handler);
  }
}
