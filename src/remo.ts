type Event<EventTypes> = {
  0: EventTypes
  1?: any
  2?: any
  3?: any
}

interface ISuccessHandler<EventTypes> extends Array<EventTypes> {
  0?: EventTypes
  1?: EventTypes
}

interface IErrorHandler<EventTypes> extends Array<EventTypes> {
  0?: EventTypes
  1?: EventTypes
}

export type EffectMap<EventTypes> = {
  dispatchN?: Array<Event<EventTypes>>
  dispatch?: Event<EventTypes>
}

export type IEventHandler<State, EventTypes> = (
  state: State,
  ...args: any[]
) => void | EffectMap<EventTypes>
export default class EventStore<State, EventTypes> {
  // public eventMap: Map<string, (state: State, ...args: any[]) => any> = new Map()
  eventMap: { [key: string]: IEventHandler<State, EventTypes> } = {}
  constructor(
    public appState: State,
  ) {}

  public on(name: EventTypes, handler: IEventHandler<State, EventTypes>) {
    this.eventMap[`${name}`] = handler
  }

  public dispatch(type?: EventTypes, ...args: any[]) {
    if (!type) {
      return Promise.resolve()
    }

    // tslint:disable-next-line:no-console
    console.info(type, args)

    const handler = this.eventMap[`${type}`]

    if (!handler) {
      throw new Error(
        `No handler found for event type ${type} with args ${args}`,
      )
    }

    const effectMap = handler(this.appState, ...args)

    if (!effectMap) {
      return Promise.resolve()
    }

    return this.effectProcessor.process(this, effectMap)
  }
}
